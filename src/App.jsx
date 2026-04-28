import { useState, useMemo, useEffect } from 'react';
import { CLIENTS, OWNERS, ROW_DATA } from './data.js';
import { DataTable } from './components/DataTable.jsx';
import { DetailPanel } from './components/DetailPanel.jsx';
import { FilterBuilder, applyConditions } from './components/FilterBuilder.jsx';
import { TweaksPanel, TweakSection, TweakToggle, TweakRadio, TweakColor } from './components/TweaksPanel.jsx';

export default function App() {
  const [tweaks, setTweaksState] = useState({ density: 'comfortable', darkMode: false, showSidebar: true, accent: '#c54a2c' });
  const setTweak = (key, val) => setTweaksState(t => ({ ...t, [key]: val }));

  const [showTweaks, setShowTweaks] = useState(false);
  const [activeClientId, setActiveClientId] = useState(CLIENTS[0].id);
  const [activeSheetId, setActiveSheetId] = useState(CLIENTS[0].seats[0].sheets[0].id);
  const [collapsedSeats, setCollapsedSeats] = useState(new Set());

  const [rowsBySheet, setRowsBySheet] = useState(ROW_DATA);
  const [search, setSearch] = useState('');
  const [conditions, setConditions] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [openedId, setOpenedId] = useState(null);
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', tweaks.accent);
    document.documentElement.style.setProperty('--accent-soft', tweaks.accent + '14');
  }, [tweaks.accent]);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  const activeClient = CLIENTS.find(c => c.id === activeClientId);

  const activeSheet = useMemo(() => {
    for (const s of activeClient.seats) {
      for (const sh of s.sheets) {
        if (sh.id === activeSheetId) return { seat: s, sheet: sh };
      }
    }
    const s0 = activeClient.seats[0];
    return { seat: s0, sheet: s0.sheets[0] };
  }, [activeClient, activeSheetId]);

  useEffect(() => {
    setSearch(''); setConditions([]); setSort(null);
    setSelected(new Set()); setOpenedId(null); setHiddenCols(new Set());
  }, [activeSheetId]);

  const onClient = (id) => {
    setActiveClientId(id);
    const c = CLIENTS.find(x => x.id === id);
    setActiveSheetId(c.seats[0].sheets[0].id);
  };

  const sheet = activeSheet.sheet;
  const columns = sheet.columns;
  const visibleColumns = columns.filter(c => !hiddenCols.has(c.key));
  const allRows = rowsBySheet[sheet.id] || [];

  const filteredRows = useMemo(() => {
    let out = allRows;
    if (search) {
      const q = search.toLowerCase();
      out = out.filter(r => Object.values(r).some(v =>
        (typeof v === 'string' && v.toLowerCase().includes(q)) ||
        (Array.isArray(v) && v.some(x => String(x).toLowerCase().includes(q)))
      ));
    }
    out = applyConditions(out, conditions);
    if (sort) {
      out = [...out].sort((a, b) => {
        const av = a[sort.col], bv = b[sort.col];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number') return sort.dir === 'asc' ? av - bv : bv - av;
        return sort.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return out;
  }, [allRows, search, conditions, sort]);

  const onSort = (col, dir) => {
    if (dir) return setSort({ col, dir });
    setSort(s => !s || s.col !== col ? { col, dir: 'asc' } : s.dir === 'asc' ? { col, dir: 'desc' } : null);
  };

  const onEdit = (id, key, value) => {
    setRowsBySheet(rs => ({
      ...rs,
      [sheet.id]: rs[sheet.id].map(r => r.id === id ? { ...r, [key]: value } : r),
    }));
  };

  const onAiRun = (idOrIds) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    const aiKey = columns.find(c => c.type === 'AI')?.key;
    if (!aiKey) { showToast('No AI column on this sheet.'); return; }
    setRowsBySheet(rs => ({
      ...rs,
      [sheet.id]: rs[sheet.id].map(r => ids.includes(r.id) ? { ...r, enrichPending: true } : r),
    }));
    showToast(`✦ Running on ${ids.length} row${ids.length === 1 ? '' : 's'}…`);
    ids.forEach((rid, idx) => setTimeout(() => {
      setRowsBySheet(rs => ({
        ...rs,
        [sheet.id]: rs[sheet.id].map(r => {
          if (r.id !== rid) return r;
          const cur = r[aiKey] || 0;
          return { ...r, [aiKey]: Math.min(100, cur + 20 + Math.floor(Math.random() * 30)), enrichPending: false };
        }),
      }));
    }, 800 + idx * 250));
  };

  const onSelectRow = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const onSelectAll = () => selected.size === filteredRows.length ? setSelected(new Set()) : setSelected(new Set(filteredRows.map(r => r.id)));

  const opened = openedId ? allRows.find(r => r.id === openedId) : null;
  const navOpened = (delta) => {
    if (!opened) return;
    const idx = filteredRows.findIndex(r => r.id === opened.id);
    const next = filteredRows[(idx + delta + filteredRows.length) % filteredRows.length];
    setOpenedId(next.id);
  };

  const toggleSeat = (id) => setCollapsedSeats(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const appCls = [tweaks.darkMode ? 'dark' : '', 'density-' + tweaks.density].filter(Boolean).join(' ');

  return (
    <div className={'app ' + appCls}>
      {/* TITLE BAR */}
      <div className="titlebar">
        <div className="traffic"><span /><span /><span /></div>
        <div className="breadcrumb">
          <span>Acme Workspace</span>
          <span style={{ color: 'var(--ink-4)' }}>/</span>
          <b style={{ color: activeClient.color }}>{activeClient.name}</b>
          <span style={{ color: 'var(--ink-4)' }}>/</span>
          <span>{activeSheet.seat.name}</span>
          <span style={{ color: 'var(--ink-4)' }}>/</span>
          <b>{sheet.name}</b>
        </div>
        <span style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4, marginRight: 10 }}>
          {CLIENTS.map(c => (
            <button key={c.id}
                    className={'client-pill' + (c.id === activeClientId ? ' active' : '')}
                    style={c.id === activeClientId ? { background: c.color, borderColor: c.color, color: '#fff' } : {}}
                    onClick={() => onClient(c.id)}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block', marginRight: 5 }} />
              {c.name}
            </button>
          ))}
          <button className="client-pill" style={{ borderStyle: 'dashed', color: 'var(--ink-3)' }}>＋ Client</button>
        </div>
        <span className="pill">⌘K</span>
        <span className="av ak">AK</span>
        <button className="btn ghost tiny" onClick={() => setShowTweaks(t => !t)} title="Tweaks">⚙</button>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <button className="btn tiny">▦ {sheet.name} ▾</button>
        <button className="btn tiny">{visibleColumns.length}/{columns.length} cols</button>
        <button className="btn tiny">{filteredRows.length}/{allRows.length} rows</button>
        <span className="sep" />
        <button className={'btn tiny ' + (conditions.length ? 'primary' : '')}
                onClick={() => setShowFilter(o => !o)}>
          ⌕ Filter
          {conditions.length > 0 && (
            <span style={{ background: '#fff', color: 'var(--accent)', borderRadius: 8, padding: '0 5px', marginLeft: 3, fontWeight: 700 }}>
              {conditions.length}
            </span>
          )}
        </button>
        <button className={'btn tiny ' + (sort ? 'primary' : '')} onClick={() => sort && setSort(null)}>
          ⇅ Sort{sort ? `: ${sort.col}` : ''}
        </button>
        <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
               style={{ padding: '4px 8px', border: '1px solid var(--line-strong)', borderRadius: 6, marginLeft: 4, width: 180, fontSize: 12, background: 'var(--panel)' }} />
        <span style={{ flex: 1 }} />
        {selected.size > 0 && (
          <>
            <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{selected.size} selected</span>
            {columns.some(c => c.type === 'AI') && (
              <button className="btn tiny primary" onClick={() => onAiRun([...selected])}>✦ Enrich</button>
            )}
            <button className="btn tiny" onClick={() => showToast('Exported ' + selected.size + ' rows')}>⤓ CSV</button>
            <button className="btn tiny ghost" onClick={() => setSelected(new Set())}>×</button>
            <span className="sep" />
          </>
        )}
        <button className="btn tiny">＋ Row</button>
        {showFilter && (
          <FilterBuilder columns={columns} conditions={conditions}
                         setConditions={setConditions} onClose={() => setShowFilter(false)} />
        )}
      </div>

      {/* BODY */}
      <div className="body">
        {tweaks.showSidebar && (
          <div className="sidebar">
            <div style={{ padding: '12px 12px 6px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Client</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: activeClient.color, display: 'inline-block' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeClient.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{activeClient.industry}</div>
                </div>
              </div>
            </div>

            {activeClient.seats.map(seat => {
              const collapsed = collapsedSeats.has(seat.id);
              return (
                <div key={seat.id}>
                  <button className="seat-header" onClick={() => toggleSeat(seat.id)}>
                    <span style={{ width: 10 }}>{collapsed ? '▸' : '▾'}</span>
                    <span style={{ flex: 1 }}>{seat.name}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: .6 }}>{seat.sheets.length}</span>
                  </button>
                  {!collapsed && seat.sheets.map(sh => (
                    <button key={sh.id}
                            className={'nav-item' + (sh.id === activeSheetId ? ' active' : '')}
                            onClick={() => setActiveSheetId(sh.id)}>
                      <span style={{ width: 14, flexShrink: 0, opacity: .6 }}>{sh.icon}</span>
                      <span className="nav-label">{sh.name}</span>
                      <span className="count">{(rowsBySheet[sh.id] || []).length}</span>
                    </button>
                  ))}
                  {!collapsed && (
                    <button className="nav-item" style={{ color: 'var(--ink-3)', paddingLeft: 28, fontSize: 11.5 }}>
                      <span style={{ width: 14, flexShrink: 0 }}>＋</span>
                      <span className="nav-label">New sheet</span>
                    </button>
                  )}
                </div>
              );
            })}

            <button className="seat-header" style={{ color: 'var(--ink-3)', borderStyle: 'dashed' }}>
              <span style={{ width: 10 }}>＋</span>
              <span style={{ flex: 1 }}>New seat</span>
            </button>

            {hiddenCols.size > 0 && (
              <>
                <h4>Hidden columns</h4>
                {[...hiddenCols].map(k => {
                  const c = columns.find(c => c.key === k);
                  if (!c) return null;
                  return (
                    <button key={k} className="nav-item"
                            onClick={() => setHiddenCols(h => { const n = new Set(h); n.delete(k); return n; })}>
                      <span style={{ width: 14, opacity: .5, flexShrink: 0 }}>−</span>
                      <span className="nav-label">{c.label}</span>
                      <span className="count">show</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}

        <div className="main">
          <DataTable
            rows={filteredRows} columns={visibleColumns}
            sort={sort} onSort={onSort}
            selected={selected} onSelectRow={onSelectRow} onSelectAll={onSelectAll}
            onOpen={(id) => setOpenedId(id === openedId ? null : id)} openedId={openedId}
            onEdit={onEdit} onAiRun={onAiRun}
            onHideCol={(k) => setHiddenCols(h => { const n = new Set(h); n.add(k); return n; })}
          />
        </div>

        {opened && (
          <DetailPanel
            row={opened} columns={columns}
            sheetName={activeClient.name + ' · ' + activeSheet.seat.name + ' · ' + sheet.name}
            onClose={() => setOpenedId(null)}
            onEdit={onEdit} onAiRun={onAiRun}
            onNext={() => navOpened(1)} onPrev={() => navOpened(-1)}
          />
        )}
      </div>

      {/* STATUS BAR */}
      <div className="statusbar">
        <span>● {activeClient.name}</span>
        <span>{activeSheet.seat.name} / {sheet.name}</span>
        <span>{filteredRows.length} rows · {columns.length} cols</span>
        <span>{selected.size > 0 ? selected.size + ' selected' : ''}</span>
        <span style={{ flex: 1 }} />
        <span>last sync 2m ago</span>
      </div>

      {toast && <div className="toast">{toast}</div>}

      <TweaksPanel title="Tweaks" open={showTweaks} onClose={() => setShowTweaks(false)}>
        <TweakSection title="Theme">
          <TweakToggle label="Dark mode" value={tweaks.darkMode} onChange={(v) => setTweak('darkMode', v)} />
          <TweakColor label="Accent" value={tweaks.accent} onChange={(v) => setTweak('accent', v)} />
        </TweakSection>
        <TweakSection title="Density">
          <TweakRadio value={tweaks.density} onChange={(v) => setTweak('density', v)}
                      options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'dense', label: 'Dense' }]} />
        </TweakSection>
        <TweakSection title="Visibility">
          <TweakToggle label="Show sidebar" value={tweaks.showSidebar} onChange={(v) => setTweak('showSidebar', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}
