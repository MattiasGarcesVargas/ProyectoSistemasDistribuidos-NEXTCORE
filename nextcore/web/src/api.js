/* ─── Helper base ─── */
const api = async (path, opts = {}) => {
  const r = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

export default api;

/* ─── Productos ─── */
export const getProducts    = (params = "") => api(`/products${params ? "?" + params : ""}`);
export const createProduct  = (data) => api("/products", { method: "POST", body: JSON.stringify(data) });
export const updateProduct  = (id, data) => api(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProduct  = (id) => api(`/products/${id}`, { method: "DELETE" });

/* ─── Categorías ─── */
export const getCategories    = () => api("/categories");
export const createCategory   = (data) => api("/categories", { method: "POST", body: JSON.stringify(data) });
export const updateCategory   = (id, data) => api(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCategory   = (id) => api(`/categories/${id}`, { method: "DELETE" });
export const getProductsByCategory = (id) => api(`/categories/${id}/productos`);

/* ─── Proveedores ─── */
export const getProviders    = () => api("/providers");
export const createProvider  = (data) => api("/providers", { method: "POST", body: JSON.stringify(data) });
export const updateProvider  = (id, data) => api(`/providers/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProvider  = (id) => api(`/providers/${id}`, { method: "DELETE" });
export const getProductsByProvider = (id) => api(`/providers/${id}/productos`);

/* ─── Movimientos ─── */
export const getMovements    = (params = "") => api(`/movements${params ? "?" + params : ""}`);
export const createMovement  = (data) => api("/movements", { method: "POST", body: JSON.stringify(data) });

/* ─── Reportes (proxy a Máquina 3) ─── */
export const getStockBajo       = () => api("/reports/low-stock");
export const getProductosMovidos = (inicio, fin) => api(`/reports/top-moved?fecha_inicio=${inicio}&fecha_fin=${fin}`);
export const getValorInventario  = () => api("/reports/inventory-value");
export const getMovimientosFecha = (inicio, fin) => api(`/reports/movements?fecha_inicio=${inicio}&fecha_fin=${fin}`);
export const getResumenProveedor = () => api("/reports/provider-summary");