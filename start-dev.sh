#!/bin/bash

# Script para iniciar el entorno de desarrollo de CMPC Libros

echo "🚀 Iniciando entorno de desarrollo CMPC Libros..."

# Verificar si Docker está corriendo
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor, inicia Docker primero."
    exit 1
fi

# Verificar si el puerto 5432 está libre
if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  El puerto 5432 está ocupado. Liberando..."
    # Intentar detener servicios de PostgreSQL locales
    sudo systemctl stop postgresql 2>/dev/null || true
    sleep 2
fi

# Limpiar contenedores anteriores
echo "🧹 Limpiando contenedores anteriores..."
docker-compose down 2>/dev/null || true

# Construir e iniciar servicios
echo "🔨 Construyendo e iniciando servicios..."
docker-compose build backend
docker-compose up -d postgres

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
until docker-compose exec postgres pg_isready -U cmpc_user -d cmpc_libros; do
    echo "  Esperando PostgreSQL..."
    sleep 3
done

echo "✅ PostgreSQL está listo!"

# Iniciar backend
echo "🚀 Iniciando backend..."
docker-compose up -d backend

# Mostrar logs
echo "📋 Mostrando logs del backend..."
echo "   Usa Ctrl+C para detener los logs (los servicios seguirán ejecutándose)"
echo "   Para detener todo: docker-compose down"
echo ""

docker-compose logs -f backend
