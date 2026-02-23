import React, { useEffect, useState } from 'react'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { getMovements, createMovement, getProducts, getProviders } from '../api'

export default function Movimientos() {
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [providers, setProviders] = useState([])
  const [modal, setModal] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroProducto, setFiltroProducto] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [form, setForm] = useState({
    tipo: 'entrada', producto_id: '', cantidad: '', fecha: '', proveedor_id: '', motivo: '', observacion: ''
  })

  const load = () => {
    const params = new URLSearchParams()
    if (filtroTipo) params.set('tipo', filtroTipo)
    if (filtroProducto) params.set('producto_id', filtroProducto)
    if (fechaInicio) params.set('fecha_inicio', fechaInicio)
    if (fechaFin) params.set('fecha_fin', fechaFin)
    getMovements(params.toString()).then(setMovements).catch(console.error)
  }

  useEffect(() => {
    load()
    getProducts().then(setProducts).catch(console.error)
    getProviders().then(setProviders).catch(console.error)
  }, [])

  useEffect(() => { load() }, [filtroTipo, filtroProducto, fechaInicio, fechaFin])

  const openNew = () => {
    setForm({ tipo: 'entrada', producto_id: '', cantidad: '', fecha: new Date().toISOString().slice(0,10), proveedor_id: '', motivo: '', observacion: '' })
    setModal(true)
  }

  const handleSave = async () => {
    await createMovement(form)
    setModal(false); load()
  }

  const selectClass = "bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
  const inputClass = "bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 w-full"

  const columns = [
    { key: 'id', label: 'ID', render: (row) => <span className="text-slate-500 font-mono text-xs">#{String(row.id).padStart(3, '0')}</span> },
    { key: 'producto', label: 'Producto', render: (row) => <span className="font-semibold text-slate-200">{row.producto || `Producto ${row.producto_id}`}</span> },
    {
      key: 'tipo', label: 'Tipo',
      render: (row) => <Badge label={row.tipo} variant={row.tipo === 'entrada' ? 'success' : 'danger'} />
    },
    {
      key: 'cantidad', label: 'Cantidad',
      render: (row) => (
        <span className={`font-semibold ${row.tipo === 'entrada' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {row.tipo === 'entrada' ? '+' : '-'}{row.cantidad} uds
        </span>
      )
    },
    { key: 'fecha', label: 'Fecha', render: (row) => <span className="text-slate-400">{row.fecha?.slice(0, 10)}</span> },
    { key: 'proveedor', label: 'Proveedor', render: (row) => <span className="text-slate-400">{row.proveedor || '—'}</span> },
    { key: 'motivo', label: 'Motivo', render: (row) => <span className="text-slate-400 text-xs">{row.motivo || '—'}</span> },
    { key: 'observacion', label: 'Observación', render: (row) => <span className="text-slate-500 text-xs">{row.observacion || '—'}</span> },
  ]

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button onClick={openNew} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-cyan-500/20">
          + Registrar Movimiento
        </button>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className={selectClass}>
          <option value="">Todos los tipos</option>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
        </select>
        <select value={filtroProducto} onChange={e => setFiltroProducto(e.target.value)} className={selectClass}>
          <option value="">Todos los productos</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className={selectClass + ' text-slate-400'} />
        <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className={selectClass + ' text-slate-400'} />
      </div>

      <Table columns={columns} data={movements} />

      <Modal open={modal} title="Registrar Movimiento" onClose={() => setModal(false)}>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Tipo</label>
            <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className={inputClass}>
              <option value="entrada">Entrada (compra/reposición)</option>
              <option value="salida">Salida (venta/despacho)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Producto</label>
            <select value={form.producto_id} onChange={e => setForm({...form, producto_id: e.target.value})} className={inputClass}>
              <option value="">Seleccionar producto</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Cantidad</label>
              <input type="number" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className={inputClass} />
            </div>
          </div>
          {form.tipo === 'entrada' && (
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Proveedor</label>
              <select value={form.proveedor_id} onChange={e => setForm({...form, proveedor_id: e.target.value})} className={inputClass}>
                <option value="">Seleccionar proveedor</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          )}
          {form.tipo === 'salida' && (
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Motivo</label>
              <input value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} placeholder="Motivo de la salida" className={inputClass} />
            </div>
          )}
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Observación</label>
            <input value={form.observacion} onChange={e => setForm({...form, observacion: e.target.value})} placeholder="Notas adicionales" className={inputClass} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 border border-white/10 text-slate-400 hover:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
              Registrar Movimiento
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
