# Propuesta de Arquitectura - CMPC Libros

## 1. Estructura del backend

Ejemplo simplificado:

```
backend/src/
├── modules/                # Módulos de NestJS (books, authors, publishers, genres, users, auth, audit)
│   ├── books/
│   ├── authors/
│   ├── publishers/
│   ├── genres/
│   ├── users/
│   └── auth/
├── infrastructure/         # Adaptadores: database (Sequelize), auth, logging, file-upload
│   ├── database/
│   ├── auth/
│   ├── logging/
│   └── file-upload/
├── shared/                 # Interceptors, filters, pipes, decorators, response helpers
├── seeds/                  # Módulo/servicio de seed (creación inicial de datos)
└── main.ts                 # Bootstrap de la aplicación
```

Notas:
- Las responsabilidades de dominio, casos de uso y DTOs están presentes dentro de los módulos y en `shared/` cuando son transversales.
- Esta organización mantiene la intención del patrón Hexagonal (ports/adapters) pero aplicada con la convención de módulos de NestJS.

## 2. Por qué no hay `core/` físico

Se decidió no crear una carpeta `core/` separada por simplicidad y por coherencia con NestJS: los módulos actúan como límites de contexto y agrupan entidades, DTOs y servicios. Esto no contradice los principios de diseño requeridos por la prueba; mantiene testabilidad, separación de responsabilidades y facilidad para extraer componentes si se quisiera promover a paquetes independientes.

## 3. Presentation / Adaptadores

Los controladores, DTOs y guards están dentro de cada módulo (por ejemplo `modules/books`), mientras que los adaptadores como repositorios Sequelize, Cloudinary/file-upload y logging residen en `infrastructure/`.


## 4. Patrones de Diseño a Implementar

### 4.1 Patrones Estructurales
- **Repository Pattern**: Abstracción de acceso a datos
- **Service Layer Pattern**: Lógica de negocio
- **DTO Pattern**: Transferencia segura de datos
- **Module Pattern**: Organización modular de NestJS

### 4.2 Patrones Comportamentales
- **Strategy Pattern**: Para filtros y ordenamiento dinámico
- **Observer Pattern**: Para logging y auditoría
- **Command Pattern**: Para operaciones CRUD complejas
- **Decorator Pattern**: Interceptors, Guards, Pipes de NestJS

### 4.3 Patrones Creacionales
- **Factory Pattern**: Creación de entidades y DTOs
- **Builder Pattern**: Para queries complejas
- **Dependency Injection**: Nativo en NestJS

## 5. Estructura del Backend (NestJS)

### 5.1 Módulos Principales
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

### 5.2 Flujo de datos real (backend)

En el backend implementado la secuencia de ejecución es la siguiente (resumida):

```
Request → Middleware / Guard → Controller (valida DTO / pipes) → Service (caso de uso / lógica de aplicación) → Repository / Sequelize Model → Database

Respuesta <- Database -> Repository / Sequelize Model -> Service (mapear a DTO/response) -> Controller (serializa/transforma) -> Client
```

Detalles:
- Middleware / Guard: manejo de autenticación, rate-limiting y otras responsabilidades transversales.
- Controller: recibe y valida DTOs (pipes), aplica guards e invoca el service apropiado.
- Service: contiene la lógica de aplicación (use-cases) y orquesta repositories, validaciones de negocio y transacciones.
- Repository / Sequelize Model: adaptación a la persistencia (queries, relaciones, soft deletes).
- DTO / Mapeos: La entrada se valida vía DTOs; el service devuelve entidades/modelos que se mapean a DTOs/response shapes antes de enviar la respuesta.

Este diagrama refleja el flujo en el código actual y respeta la convención de NestJS en el repositorio.

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

## Seed y Despliegue Local

Se incluye un mecanismo de seed que crea usuarios, autores, editoriales, géneros y 15 libros de ejemplo cuando la variable de entorno `SEED_DB=true` está presente en el entorno del backend. Las imágenes de ejemplo deben colocarse en `./assets/images` y se montan en el contenedor backend para permitir subirlas a Cloudinary durante el seed.

Usar `docker-compose up --build` con `SEED_DB=true` para ejecutar el seed automáticamente.

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
