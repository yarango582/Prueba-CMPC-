#!/bin/sh
set -e
# Ajusta permisos en runtime para volúmenes montados que pueden ser creados por el host
# Sólo intenta cambiar ownership si el proceso inicia como root (id 0)
if [ "$(id -u)" = '0' ]; then
  # Intenta cambiar ownership de uploads y node_modules si existen
  if [ -d /app/uploads ]; then
    chown -R 1001:1001 /app/uploads || true
  fi
  if [ -d /app/node_modules ]; then
    chown -R 1001:1001 /app/node_modules || true
  fi
  # También intenta asegurar permisos mínimos dentro de la carpeta de la app
  if [ -d /app/logs ]; then
    chown -R 1001:1001 /app/logs || true
  fi
fi

exec "$@"
