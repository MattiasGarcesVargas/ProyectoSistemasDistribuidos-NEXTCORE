import React, { useEffect, useState } from 'react'
import Table from '../components/Table'
import Modal from '../components/Modal'
import { getCategories, createCategory, updateCategory, deleteCategory, getProducts } from '../api'

export default function Categorias() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '' })

  const load = () => {
    getCategories().then(setCategories).catch(console.error)
    getProducts().then(setProducts).catch(console.error)
  }
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm({ nombre: '', descripcion: '' }); setModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ nombre: c.nombre, descripcion: c.descripcion || '' }); setModal(true) }

  const handleSave = async () => {
    if (editing) await updateCategory(editing.id, form)
    else await createCategory(form)
    setModal(false); load()
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar categoría?')) { await deleteCategory(id); load() }
  }

  const getProductCount = (catId) => products.filter(p => p.categoria_id === catId).length
  const getCatValue = (catId) => products.filter(p => p.categoria_id === catId)
    .reduce((s, p) => s + (Number(p.precio_unitario) || 0) * (Number(p.stock) || 0), 0)

  const inputClass = "bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 w-full"

  const columns = [
    {
      key: 'id', label: 'ID',
      render: (row) => <span className="text-slate-500 font-mono text-xs">#{String(row.id).padStart(3, '0')}</span>
    },
    {
      key: 'nombre', label: 'Nombre',
      render: (row) => <span className="font-semibold text-slate-200">{row.nombre}</span>
    },
    {
      key: 'descripcion', label: 'Descripción',
      render: (row) => <span className="text-slate-400">{row.descripcion || '—'}</span>
    },
    {
      key: 'productos', label: 'Productos',
      render: (row) => {
        const count = getProductCount(row.id)
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {count} productos
          </span>
        )
      }
    },
    {
      key: 'valor', label: 'Valor Total',
      render: (row) => <span className="text-emerald-400 font-semibold">${getCatValue(row.id).toLocaleString()}</span>
    },
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

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button onClick={openNew} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-cyan-500/20">
          + Nueva Categoría
        </button>
      </div>
      <Table columns={columns} data={categories} />

      <Modal open={modal} title={editing ? 'Editar Categoría' : 'Nueva Categoría'} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Nombre</label>
            <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Nombre de la categoría" className={inputClass} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-1 block">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Descripción de la categoría" className={`${inputClass} resize-y`} rows={3} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 border border-white/10 text-slate-400 hover:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
              {editing ? 'Guardar Cambios' : 'Crear Categoría'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
