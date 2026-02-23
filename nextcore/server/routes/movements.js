const router = require("express").Router();
const { pool } = require("../db");

// LIST con filtros: tipo, fecha_inicio, fecha_fin, producto_id
router.get("/", async (req, res) => {
  const { tipo, fecha_inicio, fecha_fin, producto_id } = req.query;
  const params = [];
  let where = "WHERE 1=1";

  if (tipo) { params.push(tipo); where += ` AND m.tipo=$${params.length}`; }
  if (producto_id) { params.push(producto_id); where += ` AND m.producto_id=$${params.length}`; }
  if (fecha_inicio) { params.push(fecha_inicio); where += ` AND m.fecha >= $${params.length}`; }
  if (fecha_fin) { params.push(fecha_fin); where += ` AND m.fecha <= $${params.length}`; }

  const sql = `
    SELECT m.*, p.nombre AS producto, pr.nombre AS proveedor
    FROM movimientos m
    JOIN productos p ON p.id = m.producto_id
    LEFT JOIN proveedores pr ON pr.id = m.proveedor_id
    ${where}
    ORDER BY m.fecha DESC, m.id DESC;
  `;
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

// CREATE movimiento + update stock (transacción)
router.post("/", async (req, res) => {
  const { tipo, producto_id, cantidad, fecha, proveedor_id, motivo, observacion } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO movimientos (tipo, producto_id, cantidad, fecha, proveedor_id, motivo, observacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7);`,
      [tipo, producto_id, cantidad, fecha, proveedor_id || null, motivo || "", observacion || ""]
    );

    // stock update
    const sign = (tipo.toLowerCase() === "entrada") ? 1 : -1;
    const delta = sign * Number(cantidad);
    await client.query(
      `UPDATE productos SET stock = stock + $1 WHERE id=$2;`,
      [delta, producto_id]
    );

    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ ok: false, error: e.message });
  } finally {
    client.release();
  }
});

module.exports = router;