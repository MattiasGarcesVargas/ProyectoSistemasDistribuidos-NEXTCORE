import React from 'react'

export default function Table({ columns, data }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/5 table-accent" style={{ background: 'var(--bg-card)' }}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-500">
                Sin datos
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-slate-300">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
