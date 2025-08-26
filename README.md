# CMPC Libros - Iniciar el entorno completo (rápido)

Este repositorio incluye un entorno Docker listo para desarrollo con PostgreSQL, Backend (NestJS) y Frontend (React + Vite).

Pasos mínimos para levantar todo (recomendado):

1. Clona el repositorio y entra al directorio:

```bash
git clone https://github.com/yarango582/Prueba-CMPC-
cd Prueba-CMPC
```

2. Ejecuta el helper que construye y levanta todos los servicios y espera a que estén listos:

```bash
chmod +x start-dev.sh && ./start-dev.sh
```

3. Accede a:

- Frontend: http://localhost:5173
- Backend (API): http://localhost:3000
- Swagger: http://localhost:3000/api/docs

Seed y datos de prueba

El proyecto incluye un seeder que se ejecuta automáticamente si `SEED_DB=true` en el entorno del backend. El script `start-dev.sh` construye e inicia los servicios y respetará `SEED_DB` establecido en `docker-compose.yml`.

Credenciales que crea el seeder (si se ejecuta):

- admin@example.com / password123  (rol: admin)
- user@example.com  / password123  (rol: user)

Notas rápidas

- Las imágenes de ejemplo están en `./assets/images` y se intentan subir a Cloudinary si las credenciales están configuradas en `docker-compose.yml`.
- Para levantar solo algunos servicios usa `docker-compose up -d postgres` o `docker-compose up -d backend`.
- Para detener todo: `docker-compose down`

Soporte y documentación técnica

- API & Swagger: http://localhost:3000/api/docs
- Modelo de base de datos: `database-model.dbml`

---

## Cobertura de tests (backend)

Resultados de la última ejecución de tests con cobertura (Jest):

- Stmts: 81.77%
- Branch: 45.77%
- Funcs: 60.50%
- Lines: 81.20%

Estos porcentajes se obtuvieron ejecutando `npm run test:cov` en `backend/`.

## Diagrama de flujo del sistema

Diagrama que muestra el flujo general entre frontend, backend y la base de datos:

![Diagrama de flujo del sistema](./docs/Diagrama%20de%20flujo.jpg)
