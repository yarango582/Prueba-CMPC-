#!/bin/sh
# Script ejecutado por la imagen oficial de Postgres cuando se monta en /docker-entrypoint-initdb.d
# Intenta asegurar permisos adecuados para que el servidor postgres pueda escribir en PGDATA
set -e

echo "[init] intentando corregir permisos en /var/lib/postgresql/data y /docker-entrypoint-initdb.d"
if [ -d /var/lib/postgresql/data ]; then
  # Intentar usar el nombre de usuario postgres para chown (funciona cuando se ejecuta como root)
  if id postgres >/dev/null 2>&1; then
    chown -R postgres:postgres /var/lib/postgresql/data || true
  else
    # fallback: intentar con UID 999
    chown -R 999:999 /var/lib/postgresql/data || true
  fi
fi

if [ -d /docker-entrypoint-initdb.d ]; then
  if id postgres >/dev/null 2>&1; then
    chown -R postgres:postgres /docker-entrypoint-initdb.d || true
  else
    chown -R 999:999 /docker-entrypoint-initdb.d || true
  fi
fi

echo "[init] permisos corregidos (si fue posible)."