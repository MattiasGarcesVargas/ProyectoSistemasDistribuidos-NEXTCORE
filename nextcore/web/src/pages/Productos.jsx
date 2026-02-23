import React, { useEffect, useState } from 'react'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, getProviders } from '../api'

const BRAND_COLORS = {
  Apple: '#3b82f6', Dell: '#22c55e', Lenovo: '#eab308',
  ASUS: '#ef4444', MSI: '#ec4899', HP: '#06b6d4',
  Samsung: '#a855f7', Acer: '#f97316',
}
const PAGE_SIZE = 6

export default function Productos() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [providers, setProviders] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [filtroMarca, setFiltroMarca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroProveedor, setFiltroProveedor] = useState('')
  const [page, setPage] = useState(1)
  const [form, setForm] = useState({
    nombre: '', descripcion: '', marca: '',
    precio_unitario: '', stock: '', stock_minimo: '',
    categoria_id: '', proveedor_id: ''
  })

  const load = () => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (filtroCategoria) params.set('categoria_id', filtroCategoria)
    if (filtroProveedor) params.set('proveedor_id', filtroProveedor)
    getProducts(params.toString()).then(setProducts).catch(console.error)
  }

  useEffect(() => {
    load()
    getCategories().then(setCategories).catch(console.error)
    getProviders().then(setProviders).catch(console.error)
  }, [])

  useEffect(() => { load(); setPage(1) }, [search, filtroCategoria, filtroProveedor])

  const filteredProducts = filtroMarca
    ? products.filter(p => p.marca === filtroMarca)
    : products
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const paginated = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const brands = [...new Set(products.map(p => p.marca).filter(Boolean))]

  const openNew = () => {
    setEditing(null)
    setForm({ nombre: '', descripcion: '', marca: '', precio_unitario: '', stock: '0', stock_minimo: '3', categoria_id: '', proveedor_id: '' })
    setModal(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      nombre: p.nombre, descripcion: p.descripcion || '', marca: p.marca || '',
      precio_unitario: p.precio_unitario, stock: p.stock,
      stock_minimo: p.stock_minimo, categoria_id: p.categoria_id || '', proveedor_id: p.proveedor_id || ''
    })
    setModal(true)
  }

  const handleSave = async () => {
    if (editing) await updateProduct(editing.id, form)
    else await createProduct(form)
    setModal(false)
    load()
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar producto?')) { await deleteProduct(id); load() }
  }

  const getStockStatus = (p) => {
    const ratio = Number(p.stock) / Math.max(Number(p.stock_minimo), 1)
    if (ratio <= 0.5) return { label: '⚠ Crítico', variant: 'danger' }
    if (ratio <= 1) return { label: '⚠ Bajo', variant: 'warning' }
    return { label: 'OK', variant: 'success' }
  }

  const getStockBarColor = (p) => {
    const ratio = Number(p.stock) / Math.max(Number(p.stock_minimo), 1)
    if (ratio <= 0.5) return 'bg-rose-500'
    if (ratio <= 1) return 'bg-amber-400'
    return 'bg-emerald-400'
  }

  const columns = [
    {
      key: 'nombre', label: 'Producto',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-200">{row.nombre}</div>
          {row.descripcion && <div className="text-[11px] text-slate-500">{row.descripcion}</div>}
        </div>
      )
    },
    {
      key: 'marca', label: 'Marca',
      render: (row) => row.marca ? (
        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white tracking-wide"
              style={{ background: BRAND_COLORS[row.marca] || '#64748b' }}>
          {row.marca}
        </span>
      ) : <span className="text-slate-600">—</span>
    },
    { key: 'categoria', label: 'Categoría', render: (row) => <span className="text-slate-400">{row.categoria || '—'}</span> },
    {
      key: 'precio_unitario', label: 'Precio Unit.',
      render: (row) => <span className="text-slate-300 font-medium">${Number(row.precio_unitario || 0).toLocaleString()}</span>
    },
    {
      key: 'stock', label: 'Stock',
      render: (row) => (
        <div className="w-20">
          <span className="text-sm font-semibold text-slate-200">{row.stock} uds</span>
          <div className="stock-bar w-full bg-slate-700/40">
            <div className={`stock-bar ${getStockBarColor(row)}`}
                 style={{ width: `${Math.min(100, (Number(row.stock) / Math.max(Number(row.stock_minimo) * 2, 1)) * 100)}%` }}></div>
          </div>
        </div>
      )
    },
    {
      key: 'estado', label: 'Estado',
      render: (row) => {
        const s = getStockStatus(row)
        return <Badge label={s.label} variant={s.variant} />
      }
    },
    { key: 'proveedor', label: 'Proveedor', render: (row) => <span className="text-slate-400">{row.proveedor || '—'}</span> },
    {
      key: 'acciones', label: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row)} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-colors" title="Editar">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={() => handleDelete(row.id)} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-400/30 transition-colors" title="Eliminar">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )
    },
  ]

  const exportCSV = () => {
    const rows = filteredProducts.map(p => ({
      ID: p.id,
      Nombre: p.nombre,
      Marca: p.marca || '',
      Descripción: p.descripcion || '',
      Categoría: p.categoria || '',
      Proveedor: p.proveedor || '',
      'Precio Unitario': p.precio_unitario,
      Stock: p.stock,
      'Stock Mínimo': p.stock_minimo,
    }))
    const headers = Object.keys(rows[0] || {})
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `productos_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const inputClass = "bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 w-full"
  const selectClass = "bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"

  return (
    <div>
      {/* Filters + Action bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <select value={filtroMarca} onChange={e => { setFiltroMarca(e.target.value); setPage(1) }} className={selectClass}>
          <option value="">Todas las marcas</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className={selectClass}>
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <select value={filtroProveedor} onChange={e => setFiltroProveedor(e.target.value)} className={selectClass}>
          <option value="">Todos los proveedores</option>
          {providers.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <div className="flex-1"></div>
        <button onClick={exportCSV} className="border border-white/10 rounded-xl px-5 py-2.5 text-sm text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors whitespace-nowrap">
          ↓ Exportar CSV
        </button>
        <button onClick={openNew} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-cyan-500/20 whitespace-nowrap">
          + Agregar Producto
        </button>
      </div>

      {/* Table */}
      <Table columns={columns} data={paginated} />

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-slate-500">Mostrando {paginated.length} productos</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 border border-white/10 disabled:opacity-30">
            ‹ Ant
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors
                      ${n === page ? 'bg-cyan-500 text-slate-900' : 'text-slate-400 hover:text-slate-200 border border-white/10'}`}>
              {n}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 border border-white/10 disabled:opacity-30">
            Sig ›
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modal} title={editing ? 'Editar Producto' : 'Nuevo Producto'} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Nombre del Producto</label>
              <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: MacBook Air 13 M4" className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Marca</label>
              <select value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} className={inputClass}>
                <option value="">Seleccionar marca</option>
                {Object.keys(BRAND_COLORS).map(b => <option key={b} value={b}>{b}</option>)}
                <option value="Otra">Otra</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Precio Unitario ($)</label>
              <input type="number" value={form.precio_unitario} onChange={e => setForm({...form, precio_unitario: e.target.value})} placeholder="1099.00" className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Categoría</label>
              <select value={form.categoria_id} onChange={e => setForm({...form, categoria_id: e.target.value})} className={inputClass}>
                <option value="">Seleccionar</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Stock Actual</label>
              <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Stock Mínimo</label>
              <input type="number" value={form.stock_minimo} onChange={e => setForm({...form, stock_minimo: e.target.value})} placeholder="3" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Proveedor</label>
            <select value={form.proveedor_id} onChange={e => setForm({...form, proveedor_id: e.target.value})} className={inputClass}>
              <option value="">Seleccionar proveedor</option>
              {providers.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Descripción / Especificaciones</label>
            <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="RAM, almacenamiento, procesador..." className={`${inputClass} resize-y`} rows={3} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 border border-white/10 text-slate-400 hover:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
              {editing ? 'Guardar Cambios' : 'Guardar Producto'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
