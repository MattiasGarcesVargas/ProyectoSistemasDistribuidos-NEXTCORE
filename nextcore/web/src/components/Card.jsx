import React from 'react'

const accentColors = {
  cyan: 'bg-cyan-400',
  green: 'bg-emerald-400',
  blue: 'bg-blue-400',
  red: 'bg-rose-500',
  yellow: 'bg-yellow-400',
  purple: 'bg-purple-400',
}

export default function Card({ title, value, subtitle, accent = 'cyan', valueColor }) {
  return (
    <div className="rounded-xl border border-white/5 p-5 relative overflow-hidden" style={{ background: 'var(--bg-card)' }}>
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentColors[accent] || accentColors.cyan}`}></div>
      <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold">{title}</p>
      <p className={`text-3xl font-extrabold mt-1 ${valueColor || 'text-slate-100'}`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  )
}
