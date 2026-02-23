const router = require("express").Router();
const { pool } = require("../db");

// LIST + filtros (q, categoria_id, proveedor_id, marca)
router.get("/", async (req, res) => {
  try {
  const { q = "", categoria_id, proveedor_id, marca } = req.query;
  const params = [];
  let where = "WHERE 1=1";

  if (q) {
    params.push(`%${q}%`);
    where += ` AND (p.nombre ILIKE $${params.length} OR p.descripcion ILIKE $${params.length})`;
  }
  if (categoria_id) {
    params.push(categoria_id);
    where += ` AND p.categoria_id = $${params.length}`;
  }
  if (proveedor_id) {
    params.push(proveedor_id);
    where += ` AND p.proveedor_id = $${params.length}`;
  }
  if (marca) {
    params.push(marca);
    where += ` AND p.marca = $${params.length}`;
  }

  const sql = `
    SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor
    FROM productos p
    LEFT JOIN categorias c ON c.id = p.categoria_id
    LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
    ${where}
    ORDER BY p.id DESC;
  `;
  const { rows } = await pool.query(sql, params);
  res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE
router.post("/", async (req, res) => {
  const {
    nombre, descripcion, marca,
    precio_unitario, stock, stock_minimo,
    categoria_id, proveedor_id
  } = req.body;

  const sql = `
    INSERT INTO productos
    (nombre, descripcion, marca, precio_unitario, stock, stock_minimo, categoria_id, proveedor_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;
  const { rows } = await pool.query(sql, [
    nombre, descripcion || "", marca || "",
    precio_unitario, stock, stock_minimo,
    categoria_id, proveedor_id
  ]);
  res.json(rows[0]);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nombre, descripcion, marca,
    precio_unitario, stock, stock_minimo,
    categoria_id, proveedor_id
  } = req.body;

  const sql = `
    UPDATE productos SET
      nombre=$1, descripcion=$2, marca=$3,
      precio_unitario=$4, stock=$5, stock_minimo=$6,
      categoria_id=$7, proveedor_id=$8
    WHERE id=$9
    RETURNING *;
  `;
  const { rows } = await pool.query(sql, [
    nombre, descripcion || "", marca || "",
    precio_unitario, stock, stock_minimo,
    categoria_id, proveedor_id, id
  ]);
  res.json(rows[0]);
});

// DELETE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM productos WHERE id=$1;", [id]);
  res.json({ ok: true });
});

module.exports = router;