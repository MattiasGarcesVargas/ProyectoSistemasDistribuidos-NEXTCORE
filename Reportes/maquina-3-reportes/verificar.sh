#!/bin/bash
# ============================================================
#  verificar.sh — Máquina 3 · Servicio de Reportes
#  Verifica conectividad Tailscale y estado de los servicios
# ============================================================

# ── CONFIGURAR ESTAS IPs ANTES DE EJECUTAR ──────────────────
M1="100.x.x.1"   # IP Tailscale de Máquina 1 (App Web)
M2="100.x.x.2"   # IP Tailscale de Máquina 2 (PostgreSQL)
M3="100.x.x.3"   # IP Tailscale de esta máquina (Reportes)
# ─────────────────────────────────────────────────────────────

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
fail() { echo -e "  ${RED}❌ $1${NC}"; }
info() { echo -e "  ${BLUE}ℹ  $1${NC}"; }

echo ""
echo -e "${BLUE}══════════════════════════════════════════════${NC}"
echo -e "${BLUE}  VERIFICACIÓN DEL SISTEMA DISTRIBUIDO        ${NC}"
echo -e "${BLUE}  Máquina 3 — Servicio de Reportes            ${NC}"
echo -e "${BLUE}══════════════════════════════════════════════${NC}"
echo ""

# ── 1. Tailscale ─────────────────────────────────────────────
echo -e "${YELLOW}[ 1/5 ] Estado de Tailscale${NC}"
if command -v tailscale &> /dev/null; then
    tailscale status
    MY_IP=$(tailscale ip -4 2>/dev/null)
    info "Tu IP Tailscale: $MY_IP"
else
    fail "Tailscale no instalado. Instalar con: curl -fsSL https://tailscale.com/install.sh | sh"
fi
echo ""

# ── 2. Ping a compañeros ─────────────────────────────────────
echo -e "${YELLOW}[ 2/5 ] Conectividad entre máquinas${NC}"
if ping -c 1 -W 2 $M1 &>/dev/null; then
    ok "Máquina 1 ($M1) — alcanzable"
else
    fail "Máquina 1 ($M1) — NO alcanzable (¿está en Tailscale?)"
fi

if ping -c 1 -W 2 $M2 &>/dev/null; then
    ok "Máquina 2 ($M2) — alcanzable"
else
    fail "Máquina 2 ($M2) — NO alcanzable (¿está en Tailscale?)"
fi
echo ""

# ── 3. PostgreSQL en M2 ──────────────────────────────────────
echo -e "${YELLOW}[ 3/5 ] Base de datos (Máquina 2)${NC}"
if nc -zw3 $M2 5432 2>/dev/null; then
    ok "PostgreSQL en $M2:5432 — accesible"
else
    fail "PostgreSQL en $M2:5432 — NO accesible"
    info "Verificar que M2 levantó el contenedor y expone el puerto"
fi
echo ""

# ── 4. Servicio propio (M3) ──────────────────────────────────
echo -e "${YELLOW}[ 4/5 ] Servicio de Reportes (esta máquina)${NC}"

CONTAINER=$(docker compose -f "$(dirname "$0")/docker-compose.yml" ps -q 2>/dev/null)
if [ -n "$CONTAINER" ]; then
    ok "Contenedor corriendo"
    docker compose -f "$(dirname "$0")/docker-compose.yml" ps
else
    fail "Contenedor NO está corriendo"
    info "Iniciar con: docker compose --env-file .env up -d --build"
fi

echo ""
HEALTH=$(curl -s http://localhost:8081/health 2>/dev/null)
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    ok "Health check: OK — BD conectada"
    echo "     Respuesta: $HEALTH"
else
    fail "Health check falló"
    echo "     Respuesta: $HEALTH"
    info "Revisar .env → DB_HOST debe ser $M2"
fi
echo ""

# ── 5. Endpoints de reportes ─────────────────────────────────
echo -e "${YELLOW}[ 5/5 ] Endpoints de Reportes${NC}"
ENDPOINTS=(
    "stock-bajo"
    "mas-movidos"
    "valor-inventario"
    "movimientos"
    "proveedores"
)

ALL_OK=true
for ep in "${ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        "http://localhost:8081/reportes/$ep/json" 2>/dev/null)
    if [ "$STATUS" = "200" ]; then
        ok "/reportes/$ep/json → HTTP $STATUS"
    else
        fail "/reportes/$ep/json → HTTP $STATUS"
        ALL_OK=false
    fi
done
echo ""

# ── Resumen ──────────────────────────────────────────────────
echo -e "${BLUE}══════════════════════════════════════════════${NC}"
if $ALL_OK; then
    echo -e "${GREEN}  ✅ Todo en orden. Listo para la demostración.${NC}"
else
    echo -e "${RED}  ❌ Hay problemas que resolver. Revisar logs:${NC}"
    echo -e "     docker compose logs -f"
fi
echo ""
echo -e "  Interfaz web:  ${BLUE}http://localhost:8081${NC}"
echo -e "  API Docs:      ${BLUE}http://localhost:8081/docs${NC}"
echo -e "  Desde M1:      ${BLUE}http://$M3:8081/reportes/stock-bajo/json${NC}"
echo -e "${BLUE}══════════════════════════════════════════════${NC}"
echo ""
