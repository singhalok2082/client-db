import { useState, useEffect, useRef } from 'react';
import { OWNERS } from '../data.js';

const TYPE_MAP = { T:'T','#':'#',D:'◷',S:'◉',M:'▣',P:'☺',U:'∞',E:'@',C:'☑',F:'ƒ',R:'↔',A:'◔',St:'●' };

export function CT({ kind }) {
  const isAi = kind === 'AI';
  return <span className={'ct' + (isAi ? ' ai' : '')}>{isAi ? '✦' : (TYPE_MAP[kind] || kind)}</span>;
}

export function renderValue(v, col, row, onEdit, onAiRun) {
  if (col.type === 'AI') {
    return (
      <span className={'prog ai' + (row.enrichPending ? ' running' : '')}
            onClick={(e) => { e.stopPropagation(); onAiRun(row.id); }}
            style={{ cursor: 'pointer' }}>
        <span className="bar"><i style={{ width: (v || 0) + '%' }} /></span>
        <span className="pct">{row.enrichPending ? '…' : (v || 0) + '%'}</span>
      </span>
    );
  }
  if (col.type === 'St') {
    const cls = String(v || '').toLowerCase().replace(/[^a-z]+/g, '-');
    return <span><span className={'dot st-' + cls} />{v}</span>;
  }
  if (col.type === 'P') {
    const o = OWNERS.find(o => o.id === v) || { id: '—', name: '', color: '' };
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span className={'av ' + o.color}>{o.id === '—' ? '?' : o.id}</span>
        <span style={{ fontSize: 12 }}>{o.name.split(' ')[0]}</span>
      </span>
    );
  }
  if (col.type === 'C') {
    return <input type="checkbox" checked={!!v}
                  onChange={(e) => onEdit(row.id, col.key, e.target.checked)}
                  onClick={(e) => e.stopPropagation()} />;
  }
  if (col.type === 'M') {
    const arr = Array.isArray(v) ? v : [];
    const visible = arr.slice(0, 2);
    return (
      <>
        {visible.map(t => <span key={t} className="chip" style={{ marginRight: 3 }}>{t}</span>)}
        {arr.length > 2 && <span className="chip">+{arr.length - 2}</span>}
      </>
    );
  }
  if (col.type === 'U') {
    return <a className="cell-link" href="#" onClick={(e) => e.preventDefault()}>{v}</a>;
  }
  if (col.type === 'F') {
    return <span className="pill">{col.prefix || ''}{typeof v === 'number' ? v.toLocaleString() : v}{col.suffix || ''}</span>;
  }
  if (col.type === 'R') {
    return <span className="chip"><span style={{ opacity: .6 }}>↔</span> {v}</span>;
  }
  if (col.type === 'D') {
    return <span className="pill" style={{ fontSize: 10.5 }}>{v}</span>;
  }
  if (col.type === '#') {
    return <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>
      {col.prefix || ''}{typeof v === 'number' ? v.toLocaleString() : v}{col.suffix || ''}
    </span>;
  }
  if (col.type === 'S') {
    return <span className="chip">{v}</span>;
  }
  return v;
}

function Cell({ row, col, onEdit, onAiRun }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(row[col.key]);

  useEffect(() => { setVal(row[col.key]); }, [row, col.key]);

  const commit = () => {
    setEditing(false);
    if (val !== row[col.key]) onEdit(row.id, col.key, val);
  };

  if (editing && col.editable) {
    return (
      <td className="cell-edit" style={{ minWidth: col.width }}>
        <input autoFocus className="cell-input" value={val ?? ''}
               onChange={(e) => setVal(e.target.value)}
               onBlur={commit}
               onKeyDown={(e) => {
                 if (e.key === 'Enter') commit();
                 if (e.key === 'Escape') { setVal(row[col.key]); setEditing(false); }
               }} />
      </td>
    );
  }

  return (
    <td style={{ minWidth: col.width, maxWidth: col.width * 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        className={col.sticky ? 'sticky' : ''}
        onDoubleClick={() => col.editable && setEditing(true)}>
      {renderValue(row[col.key], col, row, onEdit, onAiRun)}
    </td>
  );
}

function ColumnHeader({ col, sort, onSort, onHide }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const sortInd = sort?.col === col.key ? (sort.dir === 'asc' ? '↑' : '↓') : null;

  return (
    <th style={{ minWidth: col.width, maxWidth: col.width * 1.5 }}
        className={col.sticky ? 'sticky' : ''}>
      <div className="colhead colmenu" ref={ref}>
        <CT kind={col.type} />
        <span style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSort(col.key)}>
          {col.label} {sortInd && <span className="sort-ind">{sortInd}</span>}
        </span>
        <button className="btn ghost icon tiny" onClick={() => setMenuOpen(o => !o)} style={{ opacity: .6 }}>▾</button>
        {menuOpen && (
          <div className="dropdown" style={{ right: 0, left: 'auto' }}>
            <button onClick={() => { onSort(col.key, 'asc'); setMenuOpen(false); }}>↑ Sort ascending</button>
            <button onClick={() => { onSort(col.key, 'desc'); setMenuOpen(false); }}>↓ Sort descending</button>
            <div className="div" />
            <button>＋ Filter on this column</button>
            <button>⌗ Group by this column</button>
            <div className="div" />
            <button onClick={() => { onHide(col.key); setMenuOpen(false); }}>− Hide column</button>
            <button>⚙ Edit column type</button>
          </div>
        )}
      </div>
    </th>
  );
}

export function DataTable({ rows, columns, sort, onSort, selected, onSelectRow, onSelectAll, onOpen, openedId, onEdit, onAiRun, onHideCol }) {
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th className="cell-check">
              <input type="checkbox"
                     checked={selected.size === rows.length && rows.length > 0}
                     onChange={onSelectAll} />
            </th>
            <th className="cell-num">#</th>
            {columns.map(c => (
              <ColumnHeader key={c.key} col={c} sort={sort} onSort={onSort} onHide={onHideCol} />
            ))}
            <th style={{ minWidth: 60, width: 60 }}>
              <button className="btn ghost icon tiny" title="Add column">＋</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id}
                className={(selected.has(row.id) ? 'selected ' : '') + (openedId === row.id ? 'opened' : '')}
                onClick={() => onOpen(row.id)}>
              <td className="cell-check" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" checked={selected.has(row.id)} onChange={() => onSelectRow(row.id)} />
              </td>
              <td className="cell-num">{i + 1}</td>
              {columns.map(c => (
                <Cell key={c.key} row={row} col={c} onEdit={onEdit} onAiRun={onAiRun} />
              ))}
              <td />
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 3}
                  style={{ textAlign: 'center', padding: 30, color: 'var(--ink-3)' }}>
                No rows match.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
