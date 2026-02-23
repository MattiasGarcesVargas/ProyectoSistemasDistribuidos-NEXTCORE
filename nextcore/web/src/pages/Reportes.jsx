import React, { useEffect, useState } from 'react'
import Badge from '../components/Badge'
import { getStockBajo, getProductosMovidos, getValorInventario, getMovimientosFecha, getResumenProveedor } from '../api'

export default function Reportes() {
  const [tab, setTab] = useState('stock-bajo')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Default: last 30 days
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const [fechaInicio, setFechaInicio] = useState(thirtyDaysAgo)
  const [fechaFin, setFechaFin] = useState(today)

  const needsDates = tab === 'mas-movidos' || tab === 'mov-fecha'

  const loadReport = async () => {
    // Don't auto-fetch if dates are required but empty
    if (needsDates && (!fechaInicio || !fechaFin)) return
    setLoading(true); setError('');
    try {
      let result;
      switch (tab) {
        case 'stock-bajo':       result = await getStockBajo(); setData(result.data || []); break
        case 'mas-movidos':      result = await getProductosMovidos(fechaInicio, fechaFin); setData(result.data || []); break
        case 'valor-inventario': result = await getValorInventario(); setData(result.by_category || []); break
        case 'mov-fecha':        result = await getMovimientosFecha(fechaInicio, fechaFin); setData(result.data || []); break
        case 'resumen-proveedor':result = await getResumenProveedor(); setData(result.data || []); break
      }
    } catch (e) {
      setError('No se pudo conectar con el servicio de reportes (Máquina 3)'); setData([])
    }
    setLoading(false)
  }

  useEffect(() => { loadReport() }, [tab])

  const tabs = [
    { key: 'stock-bajo', label: 'Stock Bajo' },
    { key: 'mas-movidos', label: 'Más Movidos' },
    { key: 'valor-inventario', label: 'Valor Inventario' },
    { key: 'mov-fecha', label: 'Mov. por Fecha' },
    { key: 'resumen-proveedor', label: 'Resumen Proveedor' },
  ]

  const UNIT_KEYS = ['unidades', 'salidas', 'entradas', 'cantidad', 'stock', 'movimientos', 'count']
  const MONEY_KEYS = ['valor_total', 'valor_stock', 'valor_inventario', 'precio_unitario', 'precio', 'valor', 'monto', 'costo', 'price']
  const isUnitKey = (k) => UNIT_KEYS.some(uk => String(k).toLowerCase().includes(uk))
  const isMoneyKey = (k) => !isUnitKey(k) && MONEY_KEYS.some(mk => String(k).toLowerCase().includes(mk))
  const formatCell = (key, val) => {
    if (val == null || val === '') return '—'
    if (isUnitKey(key) && !isNaN(Number(val))) return String(Math.round(Number(val)))
    if (isMoneyKey(key) && !isNaN(Number(val))) return `$${Number(val).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    return String(val)
  }

  const selectClass = "bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${tab === t.key
                ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20'
                : 'border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Date filters */}
      {(tab === 'mas-movidos' || tab === 'mov-fecha') && (
        <div className="flex gap-3 mb-5">
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className={selectClass + ' text-slate-400'} />
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className={selectClass + ' text-slate-400'} />
          <button onClick={loadReport} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-5 py-2 rounded-xl text-sm font-bold transition-colors">
            Consultar
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && <p className="text-slate-500 text-sm">Cargando reporte...</p>}

      {/* Data table */}
      {!loading && !error && Array.isArray(data) && data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/5 table-accent" style={{ background: 'var(--bg-card)' }}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {Object.keys(data[0]).map(k => (
                  <th key={k} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  {Object.entries(row).map(([k, v], j) => (
                    <td key={j} className="px-5 py-3.5 text-slate-300">{formatCell(k, v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && (!Array.isArray(data) || data.length === 0) && (
        <div className="text-center py-12">
          <p className="text-slate-500 text-sm">
            {needsDates
              ? 'Selecciona el rango de fechas y presiona Consultar.'
              : 'Sin datos para este reporte.'}
          </p>
        </div>
      )}
    </div>
  )
}
