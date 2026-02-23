# NextCore Inventory System

Sistema distribuido de gestión de inventario desarrollado con arquitectura **multi-host**, Docker y Tailscale.

---

# 1. Descripción del Proyecto

NextCore es un sistema de inventario para gestión de productos (laptops), categorías, proveedores y movimientos de stock.

Arquitectura distribuida en 3 máquinas:

- Máquina 1 → Aplicación Web (React + API REST)
- Máquina 2 → Base de Datos PostgreSQL
- Máquina 3 → Servicio de Reportes independiente

---

# 2. Arquitectura del Sistema

```mermaid
flowchart LR
  A[Máquina 1<br/>App Web<br/>Puerto 8080<br/>IP 100.80.246.1]
  B[Máquina 2<br/>PostgreSQL<br/>Puerto 5432<br/>IP 100.92.73.104]
  C[Máquina 3<br/>Servicio Reportes<br/>Puerto 8081<br/>IP 100.84.96.30]

  A -->|Conexión DB| B
  A -->|Consume API Reportes| C
  C -->|Consulta DB| B
```

---

# 3. Diagrama de Base de Datos (ER)

```mermaid
erDiagram

  CATEGORIAS ||--o{ PRODUCTOS : tiene
  PROVEEDORES ||--o{ PRODUCTOS : provee
  PRODUCTOS ||--o{ MOVIMIENTOS : registra
  PROVEEDORES ||--o{ MOVIMIENTOS : participa

  CATEGORIAS {
    int id PK
    varchar nombre
    text descripcion
  }

  PROVEEDORES {
    int id PK
    varchar nombre
    varchar contacto
    varchar telefono
    varchar email
    text direccion
  }

  PRODUCTOS {
    int id PK
    varchar nombre
    text descripcion
    numeric precio_unitario
    int stock
    int stock_minimo
    varchar marca
    int categoria_id FK
    int proveedor_id FK
  }

  MOVIMIENTOS {
    int id PK
    varchar tipo
    int producto_id FK
    int cantidad
    timestamp fecha
    int proveedor_id FK
    text motivo
    text observacion
  }
```

---

# 4. Variables de Entorno

## Máquina 2 – Base de Datos

```env
DB_NAME=nextcore
DB_USER=postgres
DB_PASSWORD=macarjer26
```

## Máquina 3 – Reportes

```env
DB_HOST=100.92.73.104
DB_PORT=5432
DB_NAME=nextcore
DB_USER=postgres
DB_PASSWORD=macarjer26
```

## Máquina 1 – App Web

```env
DB_HOST=100.92.73.104
DB_PORT=5432
DB_NAME=nextcore
DB_USER=postgres
DB_PASSWORD=macarjer26

REPORT_SERVICE_URL=http://100.84.96.30:8081
```

---

# 5. Instrucciones de Despliegue Paso a Paso

## 🔹 Paso 1 – Instalar dependencias

En las 3 máquinas instalar:

- Docker Desktop
- Tailscale

Verificar IP:
```
tailscale status
```

---

## Paso 2 – Levantar Base de Datos (Máquina 2)

```
cd base-datos
docker compose up -d --build
```

Verificar:
```
docker ps
```

---

## Paso 3 – Levantar Servicio de Reportes (Máquina 3)

```
cd reportes
docker compose up -d --build
```

---

## Paso 4 – Levantar Aplicación Web (Máquina 1)

```
cd nextcore
docker compose up -d --build
```

Abrir:

```
http://100.80.246.1:8080
```

---

# 6. Pruebas de Conectividad

## Verificar Base de Datos

En Máquina 1 o 3:

```powershell
Test-NetConnection 100.92.73.104 -Port 5432
```

Debe devolver:

```
TcpTestSucceeded : True
```

## Verificar Servicio de Reportes

```
http://100.84.96.30:8081
```

---

# 7. Evidencias Recomendadas

- Captura Tailscale mostrando 3 máquinas conectadas
  <img width="1919" height="1021" alt="image" src="https://github.com/user-attachments/assets/f2e4ca47-fc94-4c91-a42d-b435f817d492" />
- Captura pgAdmin con tablas
  <img width="1919" height="1030" alt="image" src="https://github.com/user-attachments/assets/4883a5d6-e065-4d06-9154-3587730833c4" />
  <img width="1919" height="1026" alt="image" src="https://github.com/user-attachments/assets/ab675d1c-60c9-49c1-8a68-863378258559" />
  <img width="1919" height="1031" alt="image" src="https://github.com/user-attachments/assets/bf1b71e1-bed4-4852-aadc-1f59ea9efef1" />
  <img width="1919" height="1031" alt="image" src="https://github.com/user-attachments/assets/c6410066-dfb9-4dc9-9fd4-c01c8c73167b" />
- Captura App Web funcionando
  ![WhatsApp Image 2026-02-22 at 21 40 58](https://github.com/user-attachments/assets/06a39e77-63c0-4e94-955f-b284bc761278)
  ![WhatsApp Image 2026-02-22 at 21 41 15](https://github.com/user-attachments/assets/95c3614b-bed0-4a25-9dd0-88cafcfa086a)
  ![WhatsApp Image 2026-02-22 at 21 41 35](https://github.com/user-attachments/assets/a2e5beb5-7ffb-4d9b-817a-5e75bd4d4a99)
  ![WhatsApp Image 2026-02-22 at 21 41 47](https://github.com/user-attachments/assets/fabd33cd-623b-4b31-8044-2cf8481918b2)
  ![WhatsApp Image 2026-02-22 at 21 42 03](https://github.com/user-attachments/assets/da9d1db1-c6b0-4d41-a6cb-89a4f8028c55)
  ![WhatsApp Image 2026-02-22 at 21 43 39](https://github.com/user-attachments/assets/d559d51e-5cf3-42d8-8734-992000f3245a)
- Captura Reportes generados
  ![WhatsApp Image 2026-02-22 at 21 42 29](https://github.com/user-attachments/assets/a3380c84-5777-40bc-8bc4-e869d13d8282)
---

# 8. Responsables

- Mattias Garces → Máquina 1
- Carlos Gordillo → Máquina 2
- Jeremias Cabot → Máquina 3
