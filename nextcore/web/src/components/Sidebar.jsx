import { NavLink } from "react-router-dom";

const icons = {
  dashboard: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth="2"/></svg>
  ),
  productos: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="2"/><path d="M3 9h18M9 3v18" strokeWidth="2"/></svg>
  ),
  categorias: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z"/></svg>
  ),
  proveedores: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" strokeWidth="2"/><circle cx="12" cy="12" r="9" strokeWidth="2"/></svg>
  ),
  movimientos: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  reportes: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/><path d="M7 13h2v4H7zM11 9h2v8h-2zM15 11h2v6h-2z" fill="currentColor"/></svg>
  ),
};

const Item = ({ to, icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all
       ${isActive
         ? "bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 glow"
         : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
       }`
    }
  >
    {icon}
    {children}
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="w-60 flex flex-col justify-between p-5 border-r border-white/5" style={{ background: 'var(--bg-card)' }}>
      <div>
        {/* Logo */}
        <div className="mb-8">
          <div className="text-xl font-extrabold tracking-tight">
            <span className="text-white">Next</span>
            <span className="text-cyan-400">Core</span>
          </div>
          <div className="text-[9px] uppercase tracking-[0.25em] text-slate-500 mt-1 font-semibold">
            Inventory System v1.0
          </div>
        </div>

        {/* Nav sections */}
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-2 font-semibold">Main</p>
        <Item to="/" icon={icons.dashboard}>Dashboard</Item>

        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mt-5 mb-2 font-semibold">Catálogo</p>
        <Item to="/productos" icon={icons.productos}>Productos</Item>
        <Item to="/categorias" icon={icons.categorias}>Categorías</Item>
        <Item to="/proveedores" icon={icons.proveedores}>Proveedores</Item>

        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mt-5 mb-2 font-semibold">Operaciones</p>
        <Item to="/movimientos" icon={icons.movimientos}>Movimientos</Item>

        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 mt-5 mb-2 font-semibold">Análisis</p>
        <Item to="/reportes" icon={icons.reportes}>Reportes</Item>
      </div>

      {/* Footer */}
      <div className="text-xs text-slate-500 space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"></span>
          BD Conectada
        </div>
        <div className="text-[10px] text-slate-600">Máquina 1 · 100.64.0.1</div>
      </div>
    </aside>
  );
}