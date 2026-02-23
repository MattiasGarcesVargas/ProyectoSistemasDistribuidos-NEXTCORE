import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { getProducts, getCategories, getProviders, getMovements } from '../api'

/* brand colors for the stock chart */
const BRAND_COLORS = {
  Apple: '#3b82f6', Dell: '#22c55e', Lenovo: '#eab308',
  ASUS: '#ef4444', MSI: '#06b6d4', HP: '#ec4899',
  Samsung: '#a855f7', Acer: '#f97316',
}

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [movements, setMovements] = useState([])
  const [providers, setProviders] = useState([])

  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getProviders(), getMovements()])
      .then(([prods, cats, provs, movs]) => {
        setProducts(prods)
        setCategories(cats)
        setProviders(provs)
        setMovements(movs)
      })
      .catch(console.error)
  }, [])

  /* computed stats */
  const brands = [...new Set(products.map(p => p.marca).filter(Boolean))]
  const totalValue = products.reduce((s, p) => s + (Number(p.precio_unitario) || 0) * (Number(p.stock) || 0), 0)
  const entradas = movements.filter(m => m.tipo === 'entrada').length
  const salidas = movements.filter(m => m.tipo === 'salida').length
  const alertas = products.filter(p => Number(p.stock) <= Number(p.stock_minimo))

  /* stock grouped by brand */
  const stockByBrand = brands.map(b => ({
    brand: b,
    stock: products.filter(p => p.marca === b).reduce((s, p) => s + Number(p.stock || 0), 0),
  })).sort((a, b) => b.stock - a.stock)
  const maxStock = Math.max(...stockByBrand.map(b => b.stock), 1)

  /* recent movements (last 5) */
  const recentMovs = [...movements].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5)

  /* top sales (salidas this month) */
  const salidasByProduct = {}
  movements.filter(m => m.tipo === 'salida').forEach(m => {
    const name = m.producto || `Producto ${m.producto_id}`
    salidasByProduct[name] = (salidasByProduct[name] || 0) + Number(m.cantidad || 0)
  })
  const topSales = Object.entries(salidasByProduct)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

  const fmtValue = (v) => v >= 1000 ? `$${Math.round(v / 1000)}K` : `$${v}`

  return (
    <div className="space-y-5">
      {/* ─── Stat cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Productos" value={products.length} subtitle={`${brands.length} marcas · ${categories.length} categorías`} accent="cyan" />
        <Card title="Valor Inventario" value={fmtValue(totalValue)} subtitle="USD actualizado hoy" accent="green" valueColor="text-emerald-400" />
        <Card title="Mov. Este Mes" value={movements.length} subtitle={`${entradas} entradas · ${salidas} salidas`} accent="cyan" />
        <Card title="Stock Crítico" value={alertas.length} subtitle="Requieren reposición" accent="red" valueColor="text-rose-400" />
      </div>

      {/* ─── Second row: Stock chart + Alerts ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Stock por Marca */}
        <div className="lg:col-span-3 rounded-xl border border-white/5 p-5" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-200">Stock por Marca</h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">unidades</span>
          </div>
          <div className="space-y-4">
            {stockByBrand.map(b => (
              <div key={b.brand} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-16 text-right">{b.brand}</span>
                <div className="flex-1 h-3 rounded-full bg-slate-800/60 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(b.stock / maxStock) * 100}%`,
                      background: BRAND_COLORS[b.brand] || '#64748b',
                    }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-8">{b.stock}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas de Stock */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 p-5" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200">⚠ Alertas de Stock</h3>
            <button className="text-[10px] uppercase tracking-wider text-slate-500 border border-white/10 rounded-lg px-3 py-1 hover:bg-white/5">Ver todos</button>
          </div>
          <div className="space-y-3">
            {alertas.length === 0 && <p className="text-sm text-slate-500">Sin alertas</p>}
            {alertas.map(p => {
              const ratio = Number(p.stock) / Math.max(Number(p.stock_minimo), 1)
              const dotColor = ratio <= 0.5 ? 'bg-rose-500' : 'bg-amber-400'
              return (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
                    <span className="text-sm text-slate-300">{p.nombre}</span>
                  </div>
                  <span className={`text-sm font-semibold ${ratio <= 0.5 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {p.stock} / mín {p.stock_minimo}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─── Third row: Recent movements + Top Sales ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Movimientos Recientes */}
        <div className="rounded-xl border border-white/5 p-5" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200">Movimientos Recientes</h3>
            <button className="text-[10px] uppercase tracking-wider text-slate-500 border border-white/10 rounded-lg px-3 py-1 hover:bg-white/5">Ver historial</button>
          </div>
          <div className="space-y-3">
            {recentMovs.length === 0 && <p className="text-sm text-slate-500">Sin movimientos</p>}
            {recentMovs.map((m, i) => (
              <div key={m.id || i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge label={m.tipo} variant={m.tipo === 'entrada' ? 'success' : 'danger'} />
                  <span className="text-sm text-slate-300">{m.producto || `Producto ${m.producto_id}`}</span>
                </div>
                <span className={`text-sm font-semibold ${m.tipo === 'entrada' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {m.tipo === 'entrada' ? '+' : '-'}{m.cantidad} uds
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Ventas */}
        <div className="rounded-xl border border-white/5 p-5" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200">Top Ventas (Mes)</h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">salidas</span>
          </div>
          <div className="space-y-3">
            {topSales.length === 0 && <p className="text-sm text-slate-500">Sin ventas registradas</p>}
            {topSales.map((s, i) => {
              const colors = ['text-cyan-400', 'text-blue-400', 'text-violet-400', 'text-amber-400', 'text-slate-400']
              return (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${colors[i] || colors[4]}`}>#{i + 1}</span>
                    <span className="text-sm text-slate-300">{s.name}</span>
                  </div>
                  <span className={`text-sm font-semibold ${colors[i] || colors[4]}`}>{s.qty} uds</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
