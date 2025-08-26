#!/bin/sh
set -e
# Ajusta permisos en runtime para volúmenes montados en frontend
if [ "$(id -u)" = '0' ]; then
  if [ -d /app/node_modules ]; then
    chown -R node:node /app/node_modules || true
  fi
  if [ -d /app/assets ]; then
    chown -R node:node /app/assets || true
  fi
fi

exec "$@"
