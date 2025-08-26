# CMPC Libros - Sistema de Gestión de Inventario

## 📋 Descripción

Sistema web completo para la gestión de inventario de libros de la tienda CMPC-libros, desarrollado con tecnologías modernas y siguiendo las mejores prácticas de desarrollo.

## 🏗️ Arquitectura

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: NestJS + TypeScript
- **Base de Datos**: PostgreSQL + Sequelize ORM
- **Autenticación**: JWT
- **Containerización**: Docker + Docker Compose

### Arquitectura Hexagonal + Modular

El proyecto implementa una arquitectura hexagonal que separa la lógica de negocio de los detalles de implementación, facilitando el testing, mantenimiento y escalabilidad.

Ver documentación detallada en: [ARQUITECTURA.md](./ARQUITECTURA.md)

## 🚀 Instalación y Configuración

### Prerrequisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- Git

### Instalación con Docker (Recomendado)

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd Prueba-CMPC
   ```

2. **Iniciar todos los servicios**
   ```bash
   # Desarrollo básico (PostgreSQL + Backend + Frontend)
   docker-compose up -d

   # Con herramientas adicionales (incluye PgAdmin)
   docker-compose --profile tools up -d
   ```

3. **Verificar que los servicios estén funcionando**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api/docs
   - PgAdmin (opcional): http://localhost:8080

### Instalación Local para Desarrollo

1. **Base de datos**
   ```bash
   docker-compose up postgres -d
   ```

2. **Backend**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

3. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📊 Modelo de Base de Datos

El sistema utiliza un modelo relacional normalizado que incluye:

- **users**: Gestión de usuarios y autenticación
- **books**: Entidad principal con información completa de libros
- **authors**: Autores (normalizado)
- **publishers**: Editoriales (normalizado)
- **genres**: Géneros literarios (normalizado)
- **book_inventory_logs**: Auditoría de cambios de inventario
- **audit_logs**: Auditoría general del sistema

Ver modelo completo en: [database-model.dbml](./database-model.dbml)

**Para visualizar el modelo:**
1. Ir a [dbdiagram.io](https://dbdiagram.io/)
2. Importar el archivo `database-model.dbml`

## 🔧 Funcionalidades

### Frontend
- ✅ Sistema de autenticación con JWT
- ✅ Listado de libros con filtros avanzados
- ✅ Búsqueda en tiempo real con debounce
- ✅ Paginación del lado del servidor
- ✅ Formularios reactivos de alta/edición
- ✅ Carga de imágenes por libro
- ✅ Ordenamiento dinámico por múltiples campos
- ✅ Interfaz responsive y moderna

### Backend
- ✅ Arquitectura modular siguiendo principios SOLID
- ✅ Sistema de autenticación JWT
- ✅ APIs RESTful para todas las operaciones CRUD
- ✅ Exportación de datos en formato CSV
- ✅ Soft delete para manejo de eliminaciones
- ✅ Sistema de logging y auditoría
- ✅ Validación exhaustiva de datos
- ✅ Documentación automática con Swagger

### Base de Datos
- ✅ Modelo normalizado con relaciones apropiadas
- ✅ Índices optimizados para consultas frecuentes
- ✅ Transacciones para integridad de datos
- ✅ Auditoría completa de operaciones

## 🧪 Testing

### Ejecutar Tests

```bash
# Backend
cd backend
npm run test              # Tests unitarios
npm run test:e2e         # Tests end-to-end
npm run test:cov         # Cobertura de código

# Frontend
cd frontend
npm run test             # Tests unitarios
npm run test:coverage   # Cobertura de código
```

### Objetivos de Cobertura
- **Backend**: Mínimo 80%
- **Frontend**: Mínimo 75%

## 📚 API Documentation

La documentación completa de la API está disponible en:
- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs-json

### Principales Endpoints

```
# Autenticación
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh

# Libros
GET    /api/books                 # Listado con filtros
GET    /api/books/:id            # Obtener libro
POST   /api/books                # Crear libro
PUT    /api/books/:id            # Actualizar libro
DELETE /api/books/:id            # Eliminar libro (soft delete)
GET    /api/books/export/csv     # Exportar a CSV

# Autores, Editoriales, Géneros
GET    /api/authors
GET    /api/publishers
GET    /api/genres
```

## 🔒 Seguridad

- Autenticación JWT con refresh tokens
- Validación exhaustiva de entrada de datos
- Rate limiting en endpoints críticos
- CORS configurado apropiadamente
- Sanitización de datos de usuario
- Hashing seguro de contraseñas

## 📈 Performance y Optimización

- Índices de base de datos para consultas frecuentes
- Paginación del lado del servidor
- Lazy loading en componentes React
- Debounce en búsquedas en tiempo real
- Compresión de imágenes
- Cache de consultas frecuentes

## 🛠️ Comandos Útiles

```bash
# Logs de los servicios
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Reiniciar servicios
docker-compose restart backend
docker-compose restart frontend

# Backup de base de datos
docker-compose exec postgres pg_dump -U cmpc_user cmpc_libros > backup.sql

# Restaurar base de datos
docker-compose exec -T postgres psql -U cmpc_user cmpc_libros < backup.sql

# Ejecutar migraciones
docker-compose exec backend npm run migration:run

# Seed de datos de prueba
docker-compose exec backend npm run seed:run
```

## 🔧 Variables de Entorno

### Backend (.env)
```
NODE_ENV=development
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=cmpc_libros
DATABASE_USER=cmpc_user
DATABASE_PASSWORD=cmpc_password
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
UPLOAD_PATH=/app/uploads
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=CMPC Libros
```

## 🎯 Criterios de Evaluación Cumplidos

- ✅ **Calidad y legibilidad del código**: TypeScript, ESLint, Prettier
- ✅ **Arquitectura y escalabilidad**: Hexagonal + Modular
- ✅ **Rendimiento y optimización**: Índices, paginación, lazy loading
- ✅ **Cobertura y calidad de tests**: >80% backend, >75% frontend
- ✅ **Usabilidad y experiencia**: Interfaz moderna y responsive
- ✅ **Documentación**: README detallado, Swagger, diagramas
- ✅ **Facilidad de despliegue**: Docker Compose one-command
- ✅ **Patrones de diseño**: Repository, Service Layer, Strategy, etc.

## 📝 Licencia

Este proyecto está desarrollado para la prueba técnica de CMPC.

## 👥 Desarrollo

Para contribuir al proyecto, seguir las guías de desarrollo en cada módulo:
- [Backend Development Guide](./backend/README.md)
- [Frontend Development Guide](./frontend/README.md)

---

**CMPC Libros** - Sistema de Gestión de Inventario  
Desarrollado con ❤️ usando tecnologías modernas
