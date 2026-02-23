import React, { useEffect, useRef, useState } from 'react'
import { getProducts } from '../api'
import NotificationsPanel from './NotificationsPanel'

const BRAND_COLORS = {
  Apple: '#3b82f6', Dell: '#22c55e', Lenovo: '#eab308',
  ASUS: '#ef4444', MSI: '#ec4899', HP: '#06b6d4',
  Samsung: '#a855f7', Acer: '#f97316',
}

function highlight(text, query) {
  if (!query || !text) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-cyan-500/25 text-cyan-300 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function Topbar({ title }) {
  const [products, setProducts] = useState([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {})
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const criticalCount = products.filter(p => {
    const ratio = Number(p.stock) / Math.max(Number(p.stock_minimo), 1)
    return ratio <= 0.5
  }).length

  const q = search.trim().toLowerCase()
  const results = q.length < 1 ? [] : products.filter(p =>
    (p.nombre   && p.nombre.toLowerCase().includes(q)) ||
    (p.marca    && p.marca.toLowerCase().includes(q))  ||
    (p.proveedor && p.proveedor.toLowerCase().includes(q))
  ).slice(0, 8)

  return (
    <>
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5" style={{ background: 'var(--bg-card)' }}>
        {/* Title with cyan underline */}
        <div>
          <h1 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h1>
          <div className="h-0.5 w-full bg-gradient-to-r from-cyan-400 to-cyan-400/0 mt-1 rounded-full"></div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setDropdownOpen(true) }}
              onFocus={() => { if (search) setDropdownOpen(true) }}
              onKeyDown={e => e.key === 'Escape' && (setDropdownOpen(false), setSearch(''))}
              placeholder="Buscar producto, proveedor, marca..."
              className="bg-slate-800/60 border border-slate-700/50 rounded-full pl-10 pr-8 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 w-64"
            />
            {search && (
              <button onClick={() => { setSearch(''); setDropdownOpen(false) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}

            {/* Dropdown results */}
            {dropdownOpen && q.length > 0 && (
              <div className="absolute top-full mt-2 left-0 w-80 rounded-xl border border-white/8 shadow-2xl z-50 overflow-hidden"
                   style={{ background: 'var(--bg-card)' }}>
                {results.length === 0 ? (
                  <div className="px-4 py-5 text-center text-slate-500 text-sm">Sin resultados para "{search}"</div>
                ) : (
                  <>
                    <div className="px-4 pt-3 pb-1">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-slate-600 font-semibold">
                        {results.length} resultado{results.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <ul className="pb-2">
                      {results.map(p => {
                        const stockStatus = Number(p.stock) / Math.max(Number(p.stock_minimo), 1) <= 0.5
                          ? 'danger' : Number(p.stock) / Math.max(Number(p.stock_minimo), 1) <= 1 ? 'warn' : 'ok'
                        return (
                          <li key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors cursor-default">
                            {/* Marca dot */}
                            <div className="w-2 h-2 rounded-full flex-shrink-0"
                                 style={{ background: BRAND_COLORS[p.marca] || '#64748b' }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-200 truncate">{highlight(p.nombre, search)}</p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {p.marca && <span style={{ color: BRAND_COLORS[p.marca] || '#94a3b8' }}>{highlight(p.marca, search)}</span>}
                                {p.marca && p.proveedor && <span className="text-slate-600"> · </span>}
                                {p.proveedor && highlight(p.proveedor, search)}
                              </p>
                            </div>
                            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                              <span className="text-xs text-slate-400 font-medium">{p.stock} uds</span>
                              {stockStatus === 'danger' && <span className="text-[9px] text-rose-400 font-bold uppercase">Crítico</span>}
                              {stockStatus === 'warn'   && <span className="text-[9px] text-amber-400 font-bold uppercase">Bajo</span>}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Notification bell */}
          <button onClick={() => setPanelOpen(v => !v)} className="relative text-slate-400 hover:text-slate-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                {criticalCount > 9 ? '9+' : criticalCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <NotificationsPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        products={products}
      />
    </>
  )
}

