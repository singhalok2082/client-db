import { supabase } from './supabase.js';
import { CLIENTS, ROW_DATA } from '../data.js';

// ── Load ──────────────────────────────────────────────────────────────────────

export async function loadClients() {
  const { data, error } = await supabase
    .from('clients')
    .select(`*, seats(*, sheets(*, columns(*)))`)
    .order('sort_order');
  if (error) throw error;

  return data.map(client => ({
    ...client,
    seats: (client.seats || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(seat => ({
        ...seat,
        sheets: (seat.sheets || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(sheet => ({
            ...sheet,
            columns: (sheet.columns || [])
              .sort((a, b) => a.sort_order - b.sort_order)
              .map(({ key, label, type, width, options, sticky, editable, prefix, suffix }) =>
                ({ key, label, type, width, options, sticky, editable, prefix, suffix })
              ),
          })),
      })),
  }));
}

export async function loadRows(sheetId) {
  const { data, error } = await supabase
    .from('rows')
    .select('id, data, sort_order')
    .eq('sheet_id', sheetId)
    .order('sort_order');
  if (error) throw error;
  return data.map(r => ({ id: r.id, ...r.data, enrichPending: false }));
}

export async function loadRowCounts(sheetIds) {
  const { data, error } = await supabase
    .from('rows')
    .select('sheet_id')
    .in('sheet_id', sheetIds);
  if (error) return {};
  const counts = {};
  for (const { sheet_id } of data) {
    counts[sheet_id] = (counts[sheet_id] || 0) + 1;
  }
  return counts;
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function updateRow(rowId, updatedData) {
  const { id: _id, enrichPending: _ep, ...data } = updatedData;
  const { error } = await supabase.from('rows').update({ data }).eq('id', rowId);
  if (error) console.error('updateRow failed:', error.message);
}

export async function addRow(sheetId, sortOrder) {
  const { data, error } = await supabase
    .from('rows')
    .insert({ sheet_id: sheetId, data: {}, sort_order: sortOrder })
    .select('id, data')
    .single();
  if (error) throw error;
  return { id: data.id, ...data.data, enrichPending: false };
}

// ── Realtime ──────────────────────────────────────────────────────────────────

export function subscribeToRows(sheetId, onUpdate, onInsert) {
  const channel = supabase
    .channel(`rows:${sheetId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'rows',
      filter: `sheet_id=eq.${sheetId}`,
    }, payload => {
      onUpdate({ id: payload.new.id, ...payload.new.data, enrichPending: false });
    })
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'rows',
      filter: `sheet_id=eq.${sheetId}`,
    }, payload => {
      onInsert?.({ id: payload.new.id, ...payload.new.data, enrichPending: false });
    })
    .subscribe();
  return channel;
}

// ── Seed (runs once if DB is empty) ──────────────────────────────────────────

export async function seedIfEmpty() {
  const { count } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });
  if (count > 0) return;

  for (const [ci, client] of CLIENTS.entries()) {
    await supabase.from('clients').insert({
      id: client.id, name: client.name,
      color: client.color, industry: client.industry, sort_order: ci,
    });

    for (const [si, seat] of client.seats.entries()) {
      await supabase.from('seats').insert({
        id: seat.id, client_id: client.id, name: seat.name, sort_order: si,
      });

      for (const [shi, sheet] of seat.sheets.entries()) {
        await supabase.from('sheets').insert({
          id: sheet.id, seat_id: seat.id,
          name: sheet.name, icon: sheet.icon || '▦', sort_order: shi,
        });

        await supabase.from('columns').insert(
          sheet.columns.map((col, coli) => ({
            sheet_id: sheet.id,
            key: col.key, label: col.label, type: col.type,
            width: col.width || 150,
            options: col.options || null,
            sticky: col.sticky || false,
            editable: col.editable || false,
            prefix: col.prefix || null,
            suffix: col.suffix || null,
            sort_order: coli,
          }))
        );

        const originalRows = ROW_DATA[sheet.id] || [];
        if (originalRows.length > 0) {
          await supabase.from('rows').insert(
            originalRows.map((row, ri) => {
              const { id: _numId, enrichPending: _ep, ...rowData } = row;
              return { sheet_id: sheet.id, data: rowData, sort_order: ri };
            })
          );
        }
      }
    }
  }
}
