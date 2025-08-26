# Frontend - CMPC Libros

Frontend minimalista con React + TypeScript + Vite usando Material-UI y React Query.

Instrucciones rápidas:

1. Ir a la carpeta `frontend`
2. Instalar dependencias: `npm install`
3. Ejecutar en dev: `npm run dev` (será servido en http://localhost:5173)

El proxy en `vite.config.ts` apunta a `http://localhost:3000` para consumir el backend (`/api`).

Endpoints usados:
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh
- GET /api/books
- GET /api/books/:id
- POST /api/books
- PATCH /api/books/:id
- DELETE /api/books/:id
- POST /api/books/:id/upload-image
- GET /api/authors
- GET /api/publishers
- GET /api/genres

Siguientes pasos recomendados:
- Agregar validaciones con React Hook Form + Zod/Yup
- Implementar refresh token automático
- Agregar tests y linting
- Mejorar accesibilidad y estilos
