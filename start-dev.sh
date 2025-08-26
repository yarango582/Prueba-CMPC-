#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "🚀 Iniciando entorno de desarrollo CMPC Libros..."

# Check Docker
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor, inicia Docker primero."
    exit 1
fi

# Optional: try to stop local postgresql if it blocks port 5432
if ss -ltn | grep -q ':5432'; then
    echo "⚠️  Puerto 5432 en uso localmente. Intentando detener servicio local de PostgreSQL (si existe)..."
    sudo systemctl stop postgresql 2>/dev/null || true
    sleep 1
fi

echo "🧹 Deteniendo contenedores previos (si existen)..."
docker-compose down --remove-orphans || true

echo "🔨 Construyendo imágenes..."
docker-compose build --parallel

echo "📦 Iniciando servicio de base de datos..."
docker-compose up -d postgres

echo "⏳ Esperando a que PostgreSQL esté listo..."
until docker-compose exec -T postgres pg_isready -U cmpc_user -d cmpc_libros >/dev/null 2>&1; do
    printf '.'; sleep 2
done

echo "✅ PostgreSQL listo"

echo "🚀 Iniciando backend y frontend..."
docker-compose up -d backend frontend

echo "⏳ Esperando healthcheck del backend..."
until curl --output /dev/null --silent --head --fail http://localhost:3000/health; do
    printf '.'; sleep 2
done

echo "✅ Backend listo. Si SEED_DB=true, el seeding se habrá ejecutado durante el arranque."
echo "Credenciales por defecto (si el seed se ejecutó):"
echo "  - admin@example.com / password123 (role: admin)"
echo "  - user@example.com  / password123 (role: user)"
echo "Frontend disponible en: http://localhost:5173"

echo "Para ver logs del backend: docker-compose logs -f backend"
echo "Para detener todo: docker-compose down"

exit 0
