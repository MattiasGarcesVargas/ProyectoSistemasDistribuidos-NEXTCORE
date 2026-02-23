INSERT INTO categorias (nombre, descripcion) VALUES
('Gaming', 'Laptops de alto rendimiento'),
('Ultrabook', 'Livianas y portátiles'),
('Profesional', 'Para trabajo creativo'),
('Empresarial', 'Orientadas a oficina'),
('Hogar / Estudiante', 'Uso general');

INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES
('iDistributor', 'Carlos Paredes', '099998877', 'contacto@idistributor.com', 'Quito - Ecuador'),
('TechImport EC', 'Ana Torres', '099887766', 'ventas@techimport.com', 'Guayaquil'),
('GamerPro Dist.', 'Luis Almeida', '099776655', 'gamerpro@dist.com', 'Cuenca'),
('DigitalWorld', 'Jose Navas', '099665544', 'info@digitalworld.com', 'Loja'),
('MegaTech', 'Maria Rojas', '099554433', 'support@megatech.com', 'Ambato');

INSERT INTO productos (nombre, descripcion, precio_unitario, stock, stock_minimo, marca, categoria_id, proveedor_id)
VALUES
-- Apple (3)
('MacBook Air 13 M4', '8GB / 256GB / M4', 1099, 12, 3, 'Apple', 2, 1),
('MacBook Pro 14 M4', '16GB / 512GB / M4', 1599, 5, 3, 'Apple', 3, 1),
('MacBook Pro 16 M4 Pro', '24GB / 1TB / M4 Pro', 2499, 2, 3, 'Apple', 3, 1),
('MacBook Air 15 M4', '16GB / 512GB / M4', 1399, 4, 2, 'Apple', 2, 1),

-- Dell (3)
('Dell XPS 13 Plus', '16GB / 512GB / i7', 1299, 8, 4, 'Dell', 2, 2),
('Dell Alienware m16 R2', '32GB / RTX 4070', 2199, 4, 5, 'Dell', 1, 2),
('Dell Inspiron 15', '8GB / 512GB / i5', 699, 6, 2, 'Dell', 5, 2),

-- Lenovo (3)
('Lenovo Legion 5i', '16GB / 1TB / RTX 4060', 1499, 10, 4, 'Lenovo', 1, 3),
('Lenovo IdeaPad 5 Pro', '16GB / 512GB / Ryzen 7', 1099, 7, 3, 'Lenovo', 5, 3),
('Lenovo ThinkPad T14', '16GB / 512GB / i7', 1299, 5, 2, 'Lenovo', 4, 3),
('Lenovo Yoga 7i', '16GB / 512GB / i7', 999, 6, 2, 'Lenovo', 2, 3),

-- ASUS (3)
('ASUS ROG Zephyrus G14', '32GB / 1TB / RTX 4080', 2799, 3, 3, 'ASUS', 1, 4),
('ASUS VivoBook 15', '8GB / 512GB / Ryzen 5', 599, 9, 2, 'ASUS', 5, 4),
('ASUS ZenBook 14', '16GB / 512GB / i7', 999, 4, 2, 'ASUS', 2, 4),

-- MSI (3)
('MSI Raider GE78 HX', '32GB / 1TB / RTX 4080', 2799, 1, 3, 'MSI', 1, 3),
('MSI Stealth 15M', '16GB / 512GB / RTX 3060', 1299, 5, 3, 'MSI', 1, 3),
('MSI Modern 14', '8GB / 512GB / i5', 599, 7, 2, 'MSI', 5, 3),

-- HP (3)
('HP Pavilion 15', '8GB / 256GB / i5', 549, 20, 5, 'HP', 5, 2),
('HP Spectre x360 14', '16GB / 512GB / i7', 1299, 3, 2, 'HP', 3, 2),
('HP Omen 16', '16GB / 1TB / RTX 3070', 1699, 5, 3, 'HP', 1, 2);