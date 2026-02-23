const router = require("express").Router();
const { pool } = require("../db");

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categorias ORDER BY id");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories
router.post("/", async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO categorias (nombre, descripcion) VALUES ($1,$2) RETURNING *",
      [nombre, descripcion || ""]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id
router.put("/:id", async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const { rows } = await pool.query(
      "UPDATE categorias SET nombre=$1, descripcion=$2 WHERE id=$3 RETURNING *",
      [nombre, descripcion || "", req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM categorias WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET productos por categoría
router.get("/:id/productos", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM productos WHERE categoria_id=$1 ORDER BY id",
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
