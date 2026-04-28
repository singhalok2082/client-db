import { useState } from 'react';
import { CT, renderValue } from './DataTable.jsx';

export function DetailPanel({ row, columns, sheetName, onClose, onEdit, onAiRun, onNext, onPrev }) {
  const [tab, setTab] = useState('fields');
  if (!row) return null;

  const titleCol = columns.find(c => c.sticky) || columns[0];
  const title = row[titleCol.key];

  return (
    <div className="detail">
      <div className="detail-hd">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h2>
          <button className="btn ghost icon tiny" onClick={onPrev} title="Previous">◂</button>
          <button className="btn ghost icon tiny" onClick={onNext} title="Next">▸</button>
          <button className="btn ghost icon tiny" onClick={onClose} title="Close">×</button>
        </div>
        <div className="meta">{sheetName} · row {row.id}</div>
      </div>

      <div className="detail-tabs">
        {['fields', 'enrichment', 'comments', 'history'].map(t => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t === 'fields' ? 'Fields' : t === 'enrichment' ? '✦ AI' : t === 'comments' ? 'Notes' : 'Log'}
          </button>
        ))}
      </div>

      <div className="detail-body">
        {tab === 'fields' && (
          <>
            {columns.map(col => (
              <div key={col.key} className="field-row">
                <div className="field-lbl"><CT kind={col.type} />{col.label}</div>
                <div className="field-val">
                  {col.editable && ['T', '#', 'U', 'E'].includes(col.type) ? (
                    <input className="field-input"
                           defaultValue={row[col.key] ?? ''}
                           onBlur={(e) => onEdit(row.id, col.key, col.type === '#' ? +e.target.value : e.target.value)} />
                  ) : col.type === 'S' && col.options ? (
                    <select className="field-input"
                            value={row[col.key] ?? ''}
                            onChange={(e) => onEdit(row.id, col.key, e.target.value)}>
                      {col.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : col.type === 'C' ? (
                    <input type="checkbox"
                           checked={!!row[col.key]}
                           onChange={(e) => onEdit(row.id, col.key, e.target.checked)} />
                  ) : (
                    renderValue(row[col.key], col, row, onEdit, onAiRun)
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'enrichment' && (
          <div className="ai-block">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="chip accent">✦ AI</span>
              <b>Enrich this row</b>
              <span style={{ flex: 1 }} />
              <button className="btn primary tiny" onClick={() => onAiRun(row.id)}>▶ Run</button>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
              <span className="chip">summarize</span>
              <span className="chip">find contacts</span>
              <span className="chip">competitors</span>
              <span className="chip">recent news</span>
              <span className="chip dashed">＋ prompt</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 12 }}>
              Each sheet has its own AI prompts. Edit prompts in <b>Sheet settings → ✦ AI</b>.
            </div>
          </div>
        )}

        {tab === 'comments' && (
          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            Notes are scoped to this row. None yet.
          </div>
        )}

        {tab === 'history' && (
          <div style={{ fontSize: 12 }}>
            {[
              { t: '2d ago', who: 'JR', what: 'edited row' },
              { t: '5d ago', who: 'AK', what: 'created row' },
            ].map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <span className={'av ' + (h.who === 'JR' ? 'jr' : 'ak')}>{h.who}</span>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{h.t}</div>
                  <div>{h.what}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
