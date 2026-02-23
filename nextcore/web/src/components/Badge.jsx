import React from 'react'

const variants = {
  success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  danger: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
  info: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  default: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
}

export default function Badge({ label, variant = 'default' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${variants[variant]}`}>
      {label}
    </span>
  )
}
