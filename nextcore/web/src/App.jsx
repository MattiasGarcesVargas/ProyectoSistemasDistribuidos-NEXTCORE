import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import Categorias from './pages/Categorias'
import Proveedores from './pages/Proveedores'
import Movimientos from './pages/Movimientos'
import Reportes from './pages/Reportes'

const routes = [
  { path: '/', label: 'Dashboard', element: <Dashboard /> },
  { path: '/productos', label: 'Productos', element: <Productos /> },
  { path: '/categorias', label: 'Categorías', element: <Categorias /> },
  { path: '/proveedores', label: 'Proveedores', element: <Proveedores /> },
  { path: '/movimientos', label: 'Movimientos', element: <Movimientos /> },
  { path: '/reportes', label: 'Reportes', element: <Reportes /> },
]

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Routes>
            {routes.map(({ path, label, element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <>
                    <Topbar title={label} />
                    <main className="p-6">{element}</main>
                  </>
                }
              />
            ))}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
