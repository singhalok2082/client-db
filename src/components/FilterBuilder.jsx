import { TYPE_OPS } from '../data.js';

function evalCondition(row, c) {
  const v = row[c.col];
  switch (c.op) {
    case 'contains':     return String(v ?? '').toLowerCase().includes(String(c.value ?? '').toLowerCase());
    case 'is':           return String(v) === String(c.value);
    case 'is not':       return String(v) !== String(c.value);
    case 'starts with':  return String(v ?? '').toLowerCase().startsWith(String(c.value ?? '').toLowerCase());
    case 'is empty':     return !v && v !== 0;
    case 'is not empty': return !!v || v === 0;
    case '=':  return Number(v) === Number(c.value);
    case '≠':  return Number(v) !== Number(c.value);
    case '>':  return Number(v) >  Number(c.value);
    case '≥':  return Number(v) >= Number(c.value);
    case '<':  return Number(v) <  Number(c.value);
    case '≤':  return Number(v) <= Number(c.value);
    case 'is checked':     return !!v;
    case 'is not checked': return !v;
    case 'is any of': return String(c.value ?? '').split(',').map(s => s.trim()).filter(Boolean).includes(String(v));
    case 'has any':   return Array.isArray(v) ? v.length > 0 : !!v;
    default: return true;
  }
}

export function applyConditions(rows, cs) {
  if (!cs.length) return rows;
  return rows.filter(row => {
    let result = evalCondition(row, cs[0]);
    for (let i = 1; i < cs.length; i++) {
      const r = evalCondition(row, cs[i]);
      result = cs[i].conj === 'OR' ? (result || r) : (result && r);
    }
    return result;
  });
}

const NO_VALUE_OPS = ['is empty','is not empty','is checked','is not checked','within last 7d','within last 30d','has any'];

export function FilterBuilder({ columns, conditions, setConditions, onClose }) {
  const update = (i, patch) => {
    const next = [...conditions];
    next[i] = { ...next[i], ...patch };
    setConditions(next);
  };

  const add = () => {
    const c = columns[0];
    setConditions([...conditions, { col: c.key, op: (TYPE_OPS[c.type] || TYPE_OPS.T)[0], value: '', conj: 'AND' }]);
  };

  return (
    <div className="filter-pop">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <b style={{ fontSize: 13 }}>Filter</b>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)' }}>
          {conditions.length} condition{conditions.length === 1 ? '' : 's'}
        </span>
        <span style={{ flex: 1 }} />
        <button className="btn tiny ghost" onClick={() => setConditions([])}>clear</button>
        <button className="btn tiny" onClick={onClose}>done</button>
      </div>

      {conditions.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--ink-3)', padding: '8px 0' }}>
          No filters. Add one to narrow this sheet.
        </div>
      )}

      {conditions.map((c, i) => {
        const col = columns.find(x => x.key === c.col) || columns[0];
        const ops = TYPE_OPS[col.type] || TYPE_OPS.T;
        return (
          <div key={i} className="filter-row">
            <div className="conj">
              {i === 0 ? (
                <span style={{ color: 'var(--ink-3)' }}>WHERE</span>
              ) : (
                <select value={c.conj} onChange={(e) => update(i, { conj: e.target.value })} style={{ width: 50 }}>
                  <option>AND</option>
                  <option>OR</option>
                </select>
              )}
            </div>
            <select value={c.col} onChange={(e) => {
              const nc = columns.find(x => x.key === e.target.value);
              update(i, { col: e.target.value, op: (TYPE_OPS[nc.type] || TYPE_OPS.T)[0], value: '' });
            }} style={{ width: 130 }}>
              {columns.map(co => <option key={co.key} value={co.key}>{co.label}</option>)}
            </select>
            <select value={c.op} onChange={(e) => update(i, { op: e.target.value })} style={{ width: 130 }}>
              {ops.map(o => <option key={o}>{o}</option>)}
            </select>
            {!NO_VALUE_OPS.includes(c.op) && (
              col.options ? (
                <select value={c.value} onChange={(e) => update(i, { value: e.target.value })} style={{ flex: 1 }}>
                  <option value=""></option>
                  {col.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type="text" value={c.value} onChange={(e) => update(i, { value: e.target.value })}
                       placeholder="value" style={{ flex: 1 }} />
              )
            )}
            <button className="btn ghost icon tiny"
                    onClick={() => setConditions(conditions.filter((_, idx) => idx !== i))}>×</button>
          </div>
        );
      })}

      <div style={{ marginTop: 6 }}>
        <button className="btn tiny ghost" onClick={add}>＋ Add condition</button>
      </div>
    </div>
  );
}
