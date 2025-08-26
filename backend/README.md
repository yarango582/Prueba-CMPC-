# CMPC Libros - Backend API

Backend NestJS para el sistema de gestión de inventario de libros CMPC.

## 🚀 Tecnologías

- **Framework**: NestJS con TypeScript
- **Base de Datos**: PostgreSQL con Sequelize ORM
- **Autenticación**: JWT
- **Upload de Imágenes**: Cloudinary
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest
- **Logging**: Winston

## 📋 Prerrequisitos

- Node.js 18+
- PostgreSQL 12+
- Cuenta de Cloudinary (gratuita)

## ⚙️ Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

### 3. Configurar Cloudinary

1. Crear cuenta gratuita en [Cloudinary](https://cloudinary.com/)
2. Obtener las credenciales del Dashboard
3. Configurar las variables en `.env`

### 4. Configurar Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb cmpc_libros

# Las tablas se crean automáticamente al iniciar la aplicación
```

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov
```

## 📚 Documentación API

Una vez iniciado el servidor:

- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs-json

## 🔑 Endpoints Principales

### Autenticación
```
POST /api/auth/login       # Iniciar sesión
POST /api/auth/register    # Registrarse
POST /api/auth/refresh     # Renovar token
```

### Libros
```
GET    /api/books                    # Listar libros con filtros
GET    /api/books/:id               # Obtener libro por ID
POST   /api/books                   # Crear libro
PUT    /api/books/:id               # Actualizar libro
DELETE /api/books/:id               # Eliminar libro (soft delete)
POST   /api/books/:id/upload-image  # Subir imagen
GET    /api/books/export/csv        # Exportar a CSV
```

## 🗄️ Estructura de Base de Datos

### Tablas Principales
- **users**: Usuarios del sistema
- **books**: Libros con toda la información
- **authors**: Autores (normalizado)
- **publishers**: Editoriales (normalizado)  
- **genres**: Géneros literarios (normalizado)

### Tablas de Auditoría
- **audit_logs**: Auditoría general de operaciones
- **book_inventory_logs**: Historial de cambios de inventario

## 🏗️ Arquitectura

```
src/
├── auth/                    # Módulo de autenticación
├── users/                   # Gestión de usuarios
├── books/                   # Gestión de libros
├── authors/                 # Gestión de autores
├── publishers/              # Gestión de editoriales
├── genres/                  # Gestión de géneros
├── audit/                   # Sistema de auditoría
├── infrastructure/          # Servicios de infraestructura
│   ├── database/           # Modelos y configuración BD
│   ├── file-upload/        # Cloudinary
│   └── logging/            # Winston logging
└── shared/                  # Módulos compartidos
```

## 🔒 Seguridad

- Autenticación JWT con refresh tokens
- Validación de entrada con class-validator
- Sanitización de datos
- CORS configurado
- Hashing seguro de contraseñas con bcrypt

---

**CMPC Libros Backend** - Sistema robusto y escalable para gestión de inventario
