const router = require("express").Router();
const { pool } = require("../db");

// GET /api/providers
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM proveedores ORDER BY id");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/providers
router.post("/", async (req, res) => {
  try {
    const { nombre, contacto, telefono, email, direccion } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO proveedores (nombre, contacto, telefono, email, direccion)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nombre, contacto || "", telefono || "", email || "", direccion || ""]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/providers/:id
router.put("/:id", async (req, res) => {
  try {
    const { nombre, contacto, telefono, email, direccion } = req.body;
    const { rows } = await pool.query(
      `UPDATE proveedores SET nombre=$1, contacto=$2, telefono=$3, email=$4, direccion=$5
       WHERE id=$6 RETURNING *`,
      [nombre, contacto || "", telefono || "", email || "", direccion || "", req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/providers/:id
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM proveedores WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET productos por proveedor
router.get("/:id/productos", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM productos WHERE proveedor_id=$1 ORDER BY id",
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
