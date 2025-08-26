-- Inicialización de la base de datos CMPC Libros
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Crear tipos enumerados
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');
CREATE TYPE inventory_operation AS ENUM ('stock_in', 'stock_out', 'adjustment', 'initial_stock');
CREATE TYPE audit_operation AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE');

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'CMPC Libros database initialized successfully!';
    RAISE NOTICE 'Extensions and enums created.';
END $$;
