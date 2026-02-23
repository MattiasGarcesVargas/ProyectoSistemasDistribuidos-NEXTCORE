import React, { useEffect, useRef } from 'react'

export default function NotificationsPanel({ open, onClose, products }) {
  const panelRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  const critical = products.filter(p => {
    const ratio = Number(p.stock) / Math.max(Number(p.stock_minimo), 1)
    return ratio <= 0.5
  })

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.35)' }}
      />

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: '340px', background: 'var(--bg-card)', borderLeft: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-tight">Notificaciones</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {critical.length === 0 ? 'Sin alertas activas' : `${critical.length} producto${critical.length > 1 ? 's' : ''} en estado crítico`}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
          {critical.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <svg className="w-10 h-10 text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-slate-500 text-sm">Todo el stock está en buen estado.</p>
            </div>
          ) : (
            critical.map(p => {
              const faltante = Math.max(0, Number(p.stock_minimo) - Number(p.stock))
              return (
                <div key={p.id} className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="mt-0.5 w-7 h-7 rounded-lg bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{p.nombre}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Stock actual: <span className="text-rose-400 font-bold">{p.stock} uds</span>
                        {' · '}Mínimo: <span className="text-slate-300">{p.stock_minimo} uds</span>
                      </p>
                      {p.proveedor && (
                        <p className="text-[10px] text-slate-500 mt-0.5">Proveedor: {p.proveedor}</p>
                      )}
                      <p className="text-[11px] text-amber-400 mt-1.5 leading-snug">
                        ⚠ Recordatorio: comprar al menos {faltante > 0 ? faltante : p.stock_minimo} unidades para cubrir el stock mínimo.
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5">
          <p className="text-[10px] text-slate-600 text-center">Actualizado al cargar la página</p>
        </div>
      </div>
    </>
  )
}
