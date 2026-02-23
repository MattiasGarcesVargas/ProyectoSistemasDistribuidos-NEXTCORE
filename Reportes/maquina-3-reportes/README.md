# Máquina 3 — Servicio de Reportes (FastAPI)
## Inventario de Ventas de Laptops

---

## Tu responsabilidad
Generar reportes del inventario. Se conecta directo a PostgreSQL (M2).
La App Web (M1) consume tu API para mostrar reportes.

## Estructura
```
maquina-3-reportes/
├── main.py              ← FastAPI con los 5 reportes
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .env                 ← crear tú (no subir a Git)
├── verificar.sh         ← script para la demo
└── templates/           ← HTML de reportes
```

## Pasos para levantar

### 1. Instalar Tailscale
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
tailscale ip -4   # ← comparte esta IP con tus compañeros
```

### 2. Configurar .env
```bash
cp .env.example .env
nano .env   # poner IP Tailscale de M2
```

### 3. Levantar (después de M2)
```bash
docker compose --env-file .env up -d --build
curl http://localhost:8081/health
```

Abrir en navegador: **http://localhost:8081**
API Docs: **http://localhost:8081/docs**

---

## Reportes disponibles
| Reporte | HTML | JSON | CSV | PDF |
|---------|------|------|-----|-----|
| Stock Bajo | /reportes/stock-bajo | .../json | .../csv | .../pdf |
| Más Vendidas | /reportes/mas-movidos | .../json | .../csv | .../pdf |
| Valor Inventario | /reportes/valor-inventario | .../json | .../csv | .../pdf |
| Movimientos | /reportes/movimientos | .../json | .../csv | .../pdf |
| Proveedores | /reportes/proveedores | .../json | .../csv | .../pdf |
