# Propuesta de Arquitectura - CMPC Libros

## 1. Arquitectura Propuesta: Hexagonal + Modular

### ¿Por qué esta arquitectura?

**Arquitectura Hexagonal (Ports & Adapters) + Modular** es ideal para este proyecto porque:

- ✅ **Escalabilidad**: Permite añadir nuevos módulos (ej: ventas, reportes) sin afectar el core
- ✅ **Testabilidad**: Facilita el aislamiento para testing unitario (requisito de 80% cobertura)
- ✅ **Mantenibilidad**: Separación clara de responsabilidades siguiendo SOLID
- ✅ **Flexibilidad**: Permite cambiar ORMs, bases de datos o frameworks sin afectar lógica de negocio
- ✅ **Auditabilidad**: Facilita implementación de logging y auditoría de operaciones

## 2. Capas de la Arquitectura

### 2.1 Core (Dominio)
```
core/
├── domain/
│   ├── entities/          # Entidades de negocio
│   ├── repositories/      # Interfaces (Ports)
│   ├── services/          # Servicios de dominio
│   └── value-objects/     # Objetos de valor
└── application/
    ├── use-cases/         # Casos de uso
    ├── dto/              # Data Transfer Objects
    └── interfaces/       # Contratos de aplicación
```

### 2.2 Infrastructure (Adaptadores)
```
infrastructure/
├── database/
│   ├── sequelize/        # Implementación Sequelize
│   ├── repositories/     # Implementación de repositorios
│   └── migrations/       # Migraciones de BD
├── auth/                 # JWT, Guards, Strategies
├── logging/              # Winston, Audit logging
├── file-upload/          # Multer, S3/Local storage
└── external-apis/        # APIs externas (si las hay)
```

### 2.3 Presentation (API/Controllers)
```
modules/
├── books/
│   ├── controllers/      # REST Controllers
│   ├── dto/             # Request/Response DTOs
│   └── guards/          # Autenticación/Autorización
├── auth/
├── users/
└── shared/              # Interceptors, Filters, Pipes
```

## 3. Patrones de Diseño a Implementar

### 3.1 Patrones Estructurales
- **Repository Pattern**: Abstracción de acceso a datos
- **Service Layer Pattern**: Lógica de negocio
- **DTO Pattern**: Transferencia segura de datos
- **Module Pattern**: Organización modular de NestJS

### 3.2 Patrones Comportamentales
- **Strategy Pattern**: Para filtros y ordenamiento dinámico
- **Observer Pattern**: Para logging y auditoría
- **Command Pattern**: Para operaciones CRUD complejas
- **Decorator Pattern**: Interceptors, Guards, Pipes de NestJS

### 3.3 Patrones Creacionales
- **Factory Pattern**: Creación de entidades y DTOs
- **Builder Pattern**: Para queries complejas
- **Dependency Injection**: Nativo en NestJS

## 4. Estructura del Backend (NestJS)

### 4.1 Módulos Principales
```typescript
// Estructura modular
AppModule
├── AuthModule
├── UsersModule
├── BooksModule
├── AuthorsModule
├── PublishersModule
├── GenresModule
├── AuditModule
└── SharedModule
```

### 4.2 Flujo de Datos
```
Request → Controller → Use Case → Domain Service → Repository → Database
Response ← Controller ← DTO ← Domain Entity ← Repository ← Database
```

## 5. Base de Datos - Diseño Normalizado

### 5.1 Tablas Principales
- **users**: Gestión de usuarios y autenticación
- **books**: Entidad principal con todos los atributos requeridos
- **authors**: Autores de libros (normalización)
- **publishers**: Editoriales (normalización)
- **genres**: Géneros literarios (normalización)

### 5.2 Tablas de Auditoría
- **book_inventory_logs**: Historial de cambios de stock
- **audit_logs**: Auditoría general de operaciones

### 5.3 Índices para Optimización
- Índices compuestos para filtros frecuentes
- Índices únicos para integridad
- Índices en campos de búsqueda y ordenamiento

## 6. Frontend (React + TypeScript)

### 6.1 Arquitectura de Componentes
```
src/
├── components/
│   ├── ui/              # Componentes base reutilizables
│   ├── forms/           # Formularios específicos
│   └── layout/          # Layout components
├── pages/               # Páginas principales
├── hooks/               # Custom hooks
├── services/            # API calls
├── types/               # TypeScript types
├── utils/               # Utilidades
└── store/               # Estado global (Context/Zustand)
```

### 6.2 Características Técnicas
- **Formularios reactivos**: React Hook Form + Yup/Zod
- **Estado global**: Context API + useReducer o Zustand
- **Routing**: React Router v6
- **UI Components**: Material-UI o Ant Design
- **HTTP Client**: Axios con interceptors

## 7. Funcionalidades Avanzadas

### 7.1 Sistema de Filtros Dinámicos
```typescript
interface BookFilter {
  genre?: string[];
  author?: string[];
  publisher?: string[];
  availability?: boolean;
  priceRange?: [number, number];
  publicationYear?: [number, number];
}
```

### 7.2 Paginación del Servidor
```typescript
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
```

### 7.3 Búsqueda en Tiempo Real
- Debounce de 300ms
- Búsqueda por título, autor, ISBN
- Highlighting de resultados

### 7.4 Soft Delete
- Todos los registros mantienen `deleted_at`
- Filtros automáticos en consultas
- Posibilidad de restauración

## 8. Testing Strategy

### 8.1 Backend Testing
```
test/
├── unit/                # Tests unitarios
│   ├── services/
│   ├── repositories/
│   └── controllers/
├── integration/         # Tests de integración
└── e2e/                # Tests end-to-end
```

### 8.2 Frontend Testing
```
src/__tests__/
├── components/          # Component testing
├── hooks/              # Custom hooks testing
├── services/           # API services testing
└── utils/              # Utility functions testing
```

### 8.3 Cobertura Objetivo
- **Backend**: >80% cobertura (Jest + Supertest)
- **Frontend**: >75% cobertura (Jest + Testing Library)

## 9. DevOps y Despliegue

### 9.1 Docker Compose Stack
```yaml
services:
  postgres:     # Base de datos
  backend:      # API NestJS
  frontend:     # React App
  pgadmin:      # Admin BD (opcional)
```

### 9.2 Características Docker
- Multi-stage builds para optimización
- Volúmenes persistentes para datos
- Variables de entorno para configuración
- Health checks para todos los servicios

## 10. Seguridad y Performance

### 10.1 Seguridad
- JWT con refresh tokens
- Rate limiting
- CORS configurado
- Validación de entrada (class-validator)
- Sanitización de datos

### 10.2 Performance
- Lazy loading en frontend
- Índices optimizados en BD
- Cache en consultas frecuentes
- Compresión de imágenes
- CDN para assets estáticos

## 11. Escalabilidad Futura

### 11.1 Microservicios
La arquitectura modular facilita la evolución a microservicios:
- Cada módulo puede convertirse en servicio independiente
- API Gateway para enrutamiento
- Message queues para comunicación asíncrona

### 11.2 Nuevas Funcionalidades
- Sistema de ventas
- Reportes y analytics
- Notificaciones
- Integración con proveedores
- API pública para terceros

## 12. Documentación

### 12.1 API Documentation
- Swagger/OpenAPI automático
- Ejemplos de requests/responses
- Códigos de error documentados

### 12.2 Código
- JSDoc/TSDoc en funciones complejas
- README detallado por módulo
- Guías de contribución
- Arquitectura decisions records (ADRs)

---

Esta arquitectura garantiza:
- ✅ Escalabilidad y mantenibilidad
- ✅ Testabilidad (>80% cobertura)
- ✅ Performance optimizado
- ✅ Seguridad robusta
- ✅ Fácil despliegue con Docker
- ✅ Cumplimiento de principios SOLID
- ✅ Excelente experiencia de usuario
