import os
import csv
import io
from datetime import date, datetime
from typing import Optional

import psycopg2
import psycopg2.extras
from fastapi import FastAPI, Query, Response
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch

app = FastAPI(title="Servicio de Reportes - Inventario", version="1.0.0")

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 5432)),
        dbname=os.getenv("DB_NAME", "inventario"),
        user=os.getenv("DB_USER", "admin"),
        password=os.getenv("DB_PASSWORD", "admin123"),
        cursor_factory=psycopg2.extras.RealDictCursor
    )

def query(sql: str, params=None):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(sql, params or ())
        return cur.fetchall()
    finally:
        conn.close()

@app.get("/health")
def health():
    try:
        query("SELECT 1")
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "db": str(e)}


SQL_STOCK_BAJO = """
    SELECT p.id, p.nombre, p.descripcion, p.stock AS stock_actual, p.stock_minimo,
           p.precio_unitario, c.nombre AS categoria, pr.nombre AS proveedor,
           (p.stock_minimo - p.stock) AS deficit
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
    WHERE p.stock <= p.stock_minimo
    ORDER BY p.stock ASC
"""

@app.get("/reportes/stock-bajo", response_class=HTMLResponse)
def stock_bajo_html(request: Request):
    datos = query(SQL_STOCK_BAJO)
    return templates.TemplateResponse("stock_bajo.html", {"request": request, "datos": datos, "total": len(datos)})

@app.get("/reportes/stock-bajo/json")
def stock_bajo_json():
    return {"datos": [dict(r) for r in query(SQL_STOCK_BAJO)]}

@app.get("/reportes/stock-bajo/csv")
def stock_bajo_csv():
    datos = query(SQL_STOCK_BAJO)
    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=["id", "nombre", "descripcion", "categoria", "proveedor", "stock_actual", "stock_minimo", "deficit", "precio_unitario"],
        extrasaction="ignore",
    )
    writer.writeheader()
    writer.writerows([dict(r) for r in datos])
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=stock_bajo.csv"})

@app.get("/reportes/stock-bajo/pdf")
def stock_bajo_pdf():
    datos = query(SQL_STOCK_BAJO)
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(letter))
    styles = getSampleStyleSheet()
    elements = [
        Paragraph("Productos con Stock Bajo", styles["Title"]),
        Paragraph(f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')} — Total: {len(datos)} productos", styles["Normal"]),
        Spacer(1, 0.3*inch)
    ]
    headers = ["ID", "Producto", "Categoría", "Proveedor", "Stock Actual", "Stock Mínimo", "Déficit", "Precio Unit."]
    rows = [headers] + [[str(r["id"]), r["nombre"], r["categoria"] or "-", r["proveedor"] or "-",
                         str(r["stock_actual"]), str(r["stock_minimo"]), str(r["deficit"]),
                         f"${r['precio_unitario']:.2f}"] for r in datos]
    t = Table(rows, repeatRows=1)
    t.setStyle(_table_style(len(rows)))
    elements.append(t)
    doc.build(elements)
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=stock_bajo.pdf"})

# ══════════════════════════════════════════════════════════════════════════════
# REPORTE 2 — Top 10 productos más movidos
# ══════════════════════════════════════════════════════════════════════════════
SQL_MAS_MOVIDOS = """
    SELECT p.id, p.nombre, c.nombre AS categoria,
           SUM(m.cantidad) AS total_salidas,
           COUNT(m.id) AS num_movimientos
    FROM movimientos m
    JOIN productos p ON m.producto_id = p.id
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE m.tipo = 'salida'
      AND m.fecha BETWEEN %s AND %s
    GROUP BY p.id, p.nombre, c.nombre
    ORDER BY total_salidas DESC
    LIMIT 10
"""

@app.get("/reportes/mas-movidos", response_class=HTMLResponse)
def mas_movidos_html(request: Request,
                     fecha_inicio: date = Query(default=date(date.today().year, 1, 1)),
                     fecha_fin: date = Query(default=date.today())):
    datos = query(SQL_MAS_MOVIDOS, (fecha_inicio, fecha_fin))
    return templates.TemplateResponse("mas_movidos.html", {
        "request": request, "datos": datos,
        "fecha_inicio": fecha_inicio, "fecha_fin": fecha_fin
    })

@app.get("/reportes/mas-movidos/json")
def mas_movidos_json(fecha_inicio: date = Query(default=date(date.today().year, 1, 1)),
                     fecha_fin: date = Query(default=date.today())):
    return {"datos": [dict(r) for r in query(SQL_MAS_MOVIDOS, (fecha_inicio, fecha_fin))],
            "fecha_inicio": str(fecha_inicio), "fecha_fin": str(fecha_fin)}

@app.get("/reportes/mas-movidos/csv")
def mas_movidos_csv(fecha_inicio: date = Query(default=date(date.today().year, 1, 1)),
                    fecha_fin: date = Query(default=date.today())):
    datos = query(SQL_MAS_MOVIDOS, (fecha_inicio, fecha_fin))
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id","nombre","categoria","total_salidas","num_movimientos"])
    writer.writeheader()
    writer.writerows([dict(r) for r in datos])
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=mas_movidos.csv"})

@app.get("/reportes/mas-movidos/pdf")
def mas_movidos_pdf(fecha_inicio: date = Query(default=date(date.today().year, 1, 1)),
                    fecha_fin: date = Query(default=date.today())):
    datos = query(SQL_MAS_MOVIDOS, (fecha_inicio, fecha_fin))
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = [
        Paragraph("Top 10 Productos Más Movidos", styles["Title"]),
        Paragraph(f"Período: {fecha_inicio} → {fecha_fin}", styles["Normal"]),
        Spacer(1, 0.3*inch)
    ]
    headers = ["#", "Producto", "Categoría", "Total Salidas", "# Movimientos"]
    rows = [headers] + [[str(i+1), r["nombre"], r["categoria"] or "-",
                         str(r["total_salidas"]), str(r["num_movimientos"])] for i, r in enumerate(datos)]
    t = Table(rows, repeatRows=1)
    t.setStyle(_table_style(len(rows)))
    elements.append(t)
    doc.build(elements)
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=mas_movidos.pdf"})

# ══════════════════════════════════════════════════════════════════════════════
# REPORTE 3 — Valor total del inventario
# ══════════════════════════════════════════════════════════════════════════════
SQL_VALOR_INVENTARIO = """
    SELECT c.nombre AS categoria,
           COUNT(p.id) AS num_productos,
           SUM(p.stock) AS total_unidades,
           SUM(p.precio_unitario * p.stock) AS valor_total
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    GROUP BY c.nombre
    ORDER BY valor_total DESC
"""
SQL_VALOR_TOTAL = "SELECT SUM(precio_unitario * stock) AS gran_total FROM productos"

@app.get("/reportes/valor-inventario", response_class=HTMLResponse)
def valor_inventario_html(request: Request):
    datos = query(SQL_VALOR_INVENTARIO)
    gran_total = query(SQL_VALOR_TOTAL)[0]["gran_total"] or 0
    return templates.TemplateResponse("valor_inventario.html", {
        "request": request, "datos": datos, "gran_total": gran_total
    })

@app.get("/reportes/valor-inventario/json")
def valor_inventario_json():
    datos = query(SQL_VALOR_INVENTARIO)
    gran_total = query(SQL_VALOR_TOTAL)[0]["gran_total"] or 0
    return {"datos": [dict(r) for r in datos], "gran_total": float(gran_total)}

@app.get("/reportes/valor-inventario/csv")
def valor_inventario_csv():
    datos = query(SQL_VALOR_INVENTARIO)
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["categoria","num_productos","total_unidades","valor_total"])
    writer.writeheader()
    writer.writerows([dict(r) for r in datos])
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=valor_inventario.csv"})

@app.get("/reportes/valor-inventario/pdf")
def valor_inventario_pdf():
    datos = query(SQL_VALOR_INVENTARIO)
    gran_total = query(SQL_VALOR_TOTAL)[0]["gran_total"] or 0
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = [
        Paragraph("Valor Total del Inventario por Categoría", styles["Title"]),
        Paragraph(f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles["Normal"]),
        Spacer(1, 0.3*inch)
    ]
    headers = ["Categoría", "# Productos", "Total Unidades", "Valor Total"]
    rows = [headers] + [[r["categoria"] or "Sin categoría", str(r["num_productos"]),
                         str(r["total_unidades"]), f"${r['valor_total']:.2f}"] for r in datos]
    rows.append(["TOTAL GENERAL", "", "", f"${gran_total:.2f}"])
    t = Table(rows, repeatRows=1)
    t.setStyle(_table_style(len(rows), total_row=True))
    elements.append(t)
    doc.build(elements)
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=valor_inventario.pdf"})

# ══════════════════════════════════════════════════════════════════════════════
# REPORTE 4 — Movimientos por fecha
# ══════════════════════════════════════════════════════════════════════════════
SQL_MOVIMIENTOS = """
    SELECT m.id, m.fecha, m.tipo, p.nombre AS producto,
           m.cantidad, m.observacion, m.motivo,
           pr.nombre AS proveedor
    FROM movimientos m
    JOIN productos p ON m.producto_id = p.id
    LEFT JOIN proveedores pr ON m.proveedor_id = pr.id
    WHERE m.fecha BETWEEN %s AND %s
    ORDER BY m.fecha DESC
"""
SQL_TOTALES_MOV = """
    SELECT tipo, SUM(cantidad) AS total
    FROM movimientos
    WHERE fecha BETWEEN %s AND %s
    GROUP BY tipo
"""

@app.get("/reportes/movimientos", response_class=HTMLResponse)
def movimientos_html(request: Request,
                     fecha_inicio: date = Query(default=date(date.today().year, 1, 1)),
                     fecha_fin: date = Query(default=date.today())):
    datos = query(SQL_MOVIMIENTOS, (fecha_inicio, fecha_fin))
    totales = {r["tipo"]: r["total"] for r in query(SQL_TOTALES_MOV, (fecha_inicio, fecha_fin))}
    return templates.TemplateResponse("movimientos.html", {
        "request": request, "datos": datos, "totales": totales,
        "fecha_inicio": fecha_inicio, "fecha_fin": fecha_fin
    })

@app.get("/reportes/movimientos/json")
def movimientos_json(fecha_inicio: date = Query(default=date(date.today().year, 1, 1)),
                     fecha_fin: date = Query(default=date.today())):
    datos = query(SQL_MOVIMIENTOS, (fecha_inicio, fecha_fin))
    totales = {r["tipo"]: int(r["total"]) for r in query(SQL_TOTALES_MOV, (fecha_inicio, fecha_fin))}
    return {"datos": [dict(r) for r in datos], "totales": totales}

@app.get("/reportes/movimientos/csv")
def movimientos_csv(fecha_inicio: date = Query(default=date(date.today().year, 1, 1)),
                    fecha_fin: date = Query(default=date.today())):
    datos = query(SQL_MOVIMIENTOS, (fecha_inicio, fecha_fin))
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id","fecha","tipo","producto","cantidad","proveedor","observacion","motivo"])
    writer.writeheader()
    writer.writerows([dict(r) for r in datos])
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=movimientos.csv"})

@app.get("/reportes/movimientos/pdf")
def movimientos_pdf(fecha_inicio: date = Query(default=date(date.today().year, 1, 1)),
                    fecha_fin: date = Query(default=date.today())):
    datos = query(SQL_MOVIMIENTOS, (fecha_inicio, fecha_fin))
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(letter))
    styles = getSampleStyleSheet()
    elements = [
        Paragraph("Movimientos de Inventario", styles["Title"]),
        Paragraph(f"Período: {fecha_inicio} → {fecha_fin} — Total: {len(datos)} registros", styles["Normal"]),
        Spacer(1, 0.3*inch)
    ]
    headers = ["ID", "Fecha", "Tipo", "Producto", "Cantidad", "Proveedor", "Observación"]
    rows = [headers] + [[str(r["id"]), str(r["fecha"]), r["tipo"].upper(), r["producto"],
                         str(r["cantidad"]), r["proveedor"] or "-",
                         (r["observacion"] or r["motivo"] or "-")[:40]] for r in datos]
    t = Table(rows, repeatRows=1)
    t.setStyle(_table_style(len(rows)))
    elements.append(t)
    doc.build(elements)
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=movimientos.pdf"})

# ══════════════════════════════════════════════════════════════════════════════
# REPORTE 5 — Resumen por proveedor
# ══════════════════════════════════════════════════════════════════════════════
SQL_PROVEEDORES = """
    SELECT pr.id, pr.nombre, pr.contacto, pr.email, pr.telefono,
           COUNT(p.id) AS num_productos,
        COALESCE(SUM(p.stock), 0) AS total_unidades,
        COALESCE(SUM(p.precio_unitario * p.stock), 0) AS valor_total
    FROM proveedores pr
    LEFT JOIN productos p ON p.proveedor_id = pr.id
    GROUP BY pr.id, pr.nombre, pr.contacto, pr.email, pr.telefono
    ORDER BY valor_total DESC
"""

@app.get("/reportes/proveedores", response_class=HTMLResponse)
def proveedores_html(request: Request):
    datos = query(SQL_PROVEEDORES)
    return templates.TemplateResponse("proveedores.html", {"request": request, "datos": datos})

@app.get("/reportes/proveedores/json")
def proveedores_json():
    return {"datos": [dict(r) for r in query(SQL_PROVEEDORES)]}

@app.get("/reportes/proveedores/csv")
def proveedores_csv():
    datos = query(SQL_PROVEEDORES)
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id","nombre","contacto","email","telefono","num_productos","total_unidades","valor_total"])
    writer.writeheader()
    writer.writerows([dict(r) for r in datos])
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=proveedores.csv"})

@app.get("/reportes/proveedores/pdf")
def proveedores_pdf():
    datos = query(SQL_PROVEEDORES)
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(letter))
    styles = getSampleStyleSheet()
    elements = [
        Paragraph("Resumen de Inventario por Proveedor", styles["Title"]),
        Paragraph(f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles["Normal"]),
        Spacer(1, 0.3*inch)
    ]
    headers = ["ID", "Proveedor", "Contacto", "Email", "# Productos", "Unidades", "Valor Total"]
    rows = [headers] + [[str(r["id"]), r["nombre"], r["contacto"] or "-", r["email"] or "-",
                         str(r["num_productos"]), str(r["total_unidades"]),
                         f"${r['valor_total']:.2f}"] for r in datos]
    t = Table(rows, repeatRows=1)
    t.setStyle(_table_style(len(rows)))
    elements.append(t)
    doc.build(elements)
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=proveedores.pdf"})

# ── Index ────────────────────────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/reports/low-stock")
def reports_low_stock():
    datos = [dict(r) for r in query(SQL_STOCK_BAJO)]
    return {"count": len(datos), "data": datos}

@app.get("/reports/low-stock/csv")
def reports_low_stock_csv():
    return stock_bajo_csv()

@app.get("/reports/low-stock/pdf")
def reports_low_stock_pdf():
    return stock_bajo_pdf()

@app.get("/reports/top-moved")
def reports_top_moved(
    fecha_inicio: date = Query(..., description="YYYY-MM-DD"),
    fecha_fin: date = Query(..., description="YYYY-MM-DD"),
):
    datos = [dict(r) for r in query(SQL_MAS_MOVIDOS, (fecha_inicio, fecha_fin))]
    return {
        "range": {"from": str(fecha_inicio), "to": str(fecha_fin)},
        "count": len(datos),
        "data": datos,
    }

@app.get("/reports/inventory-value")
def reports_inventory_value():
    by_category = [dict(r) for r in query(SQL_VALOR_INVENTARIO)]
    total = query(SQL_VALOR_TOTAL)[0]["gran_total"] or 0
    return {"total_inventario": float(total), "by_category": by_category}

@app.get("/reports/movements")
def reports_movements(
    fecha_inicio: date = Query(..., description="YYYY-MM-DD"),
    fecha_fin: date = Query(..., description="YYYY-MM-DD"),
):
    datos = [dict(r) for r in query(SQL_MOVIMIENTOS, (fecha_inicio, fecha_fin))]
    base_totales = query(SQL_TOTALES_MOV, (fecha_inicio, fecha_fin))
    totales = {
        "total_entradas": int(next((r["total"] for r in base_totales if r["tipo"] == "entrada"), 0)),
        "total_salidas": int(next((r["total"] for r in base_totales if r["tipo"] == "salida"), 0)),
    }
    return {
        "range": {"from": str(fecha_inicio), "to": str(fecha_fin)},
        "totals": totales,
        "count": len(datos),
        "data": datos,
    }

@app.get("/reports/provider-summary")
def reports_provider_summary():
    datos = [dict(r) for r in query(SQL_PROVEEDORES)]
    return {"count": len(datos), "data": datos}

# ── PDF helper ───────────────────────────────────────────────────────────────
def _table_style(n_rows: int, total_row=False):
    style = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563EB")),
        ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, 0), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F1F5F9")]),
        ("FONTSIZE",   (0, 1), (-1, -1), 9),
        ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("ALIGN",      (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ])
    if total_row:
        style.add("BACKGROUND", (0, n_rows-1), (-1, n_rows-1), colors.HexColor("#1E3A5F"))
        style.add("TEXTCOLOR",  (0, n_rows-1), (-1, n_rows-1), colors.white)
        style.add("FONTNAME",   (0, n_rows-1), (-1, n_rows-1), "Helvetica-Bold")
    return style
