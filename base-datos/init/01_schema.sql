DROP TABLE IF EXISTS movimientos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS proveedores;
DROP TABLE IF EXISTS categorias;

CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT
);

CREATE TABLE proveedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) UNIQUE NOT NULL,
  contacto VARCHAR(120),
  telefono VARCHAR(20),
  email VARCHAR(120),
  direccion TEXT
);

CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  precio_unitario NUMERIC(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 0,
  marca VARCHAR(50) NOT NULL,
  categoria_id INT NOT NULL REFERENCES categorias(id),
  proveedor_id INT NOT NULL REFERENCES proveedores(id)
);

CREATE TABLE movimientos (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada','salida')),
  producto_id INT NOT NULL REFERENCES productos(id),
  cantidad INT NOT NULL CHECK (cantidad > 0),
  fecha TIMESTAMP NOT NULL DEFAULT NOW(),
  proveedor_id INT REFERENCES proveedores(id),
  motivo TEXT,
  observacion TEXT
);

CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo);