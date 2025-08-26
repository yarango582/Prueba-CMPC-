# Decisiones Arquitectónicas - CMPC Libros

## 🎯 Resumen Ejecutivo

Este documento justifica las decisiones arquitectónicas tomadas para el sistema CMPC Libros, explicando **por qué** cada elección es la más adecuada para cumplir con los criterios de evaluación y requerimientos del proyecto.

## 1. Arquitectura Principal: Hexagonal + Modular (ajustada al repositorio)

### ✅ Decisión: Arquitectura Hexagonal combinada con Modular de NestJS

La justificación permanece, pero se ajusta la descripción a la estructura real del repositorio: en lugar de una carpeta `core/` separada, la separación lógica se aplica mediante módulos (`modules/*`), `infrastructure/` y `shared/` dentro de `src/`.

Alternativas evaluadas (mismas que antes) se mantienen, y la decisión por NestJS + módulos se conserva por las mismas razones: testabilidad, modularidad y soporte para patrones SOLID.

## 2. Stack Tecnológico

### 2.1 Backend: NestJS + TypeScript

**✅ Decisión: NestJS como framework principal**

**Justificación:**
- **SOLID**: Framework diseñado con principios SOLID nativos
- **Modularidad**: Sistema de módulos que facilita organización
- **Testing**: Herramientas integradas para testing (Jest)
- **Documentación**: Swagger/OpenAPI automático
- **Interceptors**: Facilita logging y transformación de respuestas
- **TypeScript**: Type safety requerido en la especificación

### 2.2 ORM: Sequelize

**✅ Decisión: Sequelize como ORM**

**Justificación:**
- **Requerimiento explícito**: Especificado en la prueba técnica
- **Transacciones**: Soporte robusto para transacciones (requerido)
- **Migraciones**: Versionado de esquema de BD
- **Validaciones**: Validaciones a nivel de modelo
- **PostgreSQL**: Excelente compatibilidad

### 2.3 Frontend: React + TypeScript + Vite

**✅ Decisión: React con TypeScript y Vite**

**Justificación:**
- **Requerimiento**: React especificado en la prueba
- **TypeScript**: Type safety y mejor DX
- **Vite**: Build tool moderno, HMR rápido
- **Ecosistema**: Amplia disponibilidad de librerías
- **Testing**: Excelente soporte con Testing Library

### 2.4 Base de Datos: PostgreSQL

**✅ Decisión: PostgreSQL**

**Justificación:**
- **Requerimiento explícito**: Especificado en la prueba
- **ACID**: Transacciones robustas para integridad de datos
- **JSON**: Soporte nativo para campos JSON (audit logs)
- **Índices**: Índices avanzados para optimización
- **Escalabilidad**: Maneja bien el crecimiento de datos

## 3. Patrones de Diseño Implementados

### 3.1 Repository Pattern

**✅ Decisión: Implementar Repository Pattern**

**Justificación:**
- **Abstracción**: Separa lógica de negocio del acceso a datos
- **Testabilidad**: Facilita mocking en tests unitarios
- **Flexibilidad**: Permite cambiar implementación de persistencia
- **SOLID**: Cumple con Dependency Inversion Principle

### 3.2 Service Layer Pattern

**✅ Decisión: Capa de servicios robusta**

**Justificación:**
- **Encapsulación**: Lógica de negocio centralizada
- **Reutilización**: Servicios reutilizables entre controllers
- **Transacciones**: Manejo centralizado de transacciones
- **Validaciones**: Validaciones de negocio centralizadas

### 3.3 DTO Pattern

**✅ Decisión: DTOs para transferencia de datos**

**Justificación:**
- **Validación**: Validación automática con class-validator
- **Transformación**: Transformación automática de datos
- **Documentación**: Documentación automática en Swagger
- **Seguridad**: Control explícito de qué datos se exponen

## 4. Funcionalidades Técnicas Avanzadas

### 4.1 Soft Delete

**✅ Decisión: Implementar soft delete en todas las entidades**

**Justificación:**
- **Requerimiento**: Especificado en la prueba técnica
- **Auditoría**: Mantiene historial para auditoría
- **Recuperación**: Permite restaurar datos eliminados
- **Integridad**: Evita problemas de referential integrity

### 4.2 Sistema de Auditoría

**✅ Decisión: Auditoría completa con tabla audit_logs**

**Justificación:**
- **Requerimiento**: Sistema de logging especificado
- **Compliance**: Requisitos de auditoría empresarial
- **Debugging**: Facilita identificación de problemas
- **Seguridad**: Tracking de operaciones sensibles

### 4.3 Filtros Dinámicos y Paginación del Servidor

**✅ Decisión: Filtros complejos con paginación server-side**

**Justificación:**
- **Performance**: Reduce carga en frontend y red
- **Escalabilidad**: Maneja grandes volúmenes de datos
- **UX**: Respuesta rápida al usuario
- **SEO**: URLs compartibles con filtros

### 4.4 Búsqueda en Tiempo Real con Debounce

**✅ Decisión: Búsqueda con debounce de 300ms**

**Justificación:**
- **Performance**: Reduce calls innecesarios al API
- **UX**: Respuesta inmediata pero controlada
- **Recursos**: Optimiza uso de BD y red
- **Escalabilidad**: Previene sobrecarga del servidor

## 5. Decisiones de Seguridad

### 5.1 JWT con Refresh Tokens

**✅ Decisión: JWT con sistema de refresh tokens**

**Justificación:**
- **Stateless**: No requiere sesiones en servidor
- **Escalabilidad**: Facilita escalamiento horizontal
- **Seguridad**: Tokens de corta duración + refresh
- **Performance**: Validación rápida sin consultas BD

### 5.2 Validación en Múltiples Capas

**✅ Decisión: Validación en Frontend + Backend + BD**

**Justificación:**
- **Seguridad**: Defense in depth
- **UX**: Feedback inmediato en frontend
- **Integridad**: Garantía final en BD
- **Robustez**: Manejo de ataques y errores

## 6. Decisiones de Performance

### 6.1 Índices de Base de Datos

**✅ Decisión: Índices estratégicos en campos de consulta frecuente**

**Justificación:**
- **Performance**: Consultas rápidas en filtros
- **Escalabilidad**: Mantiene performance con crecimiento
- **UX**: Respuesta rápida en búsquedas
- **Específicos**: Índices compuestos para queries complejas

### 6.2 Lazy Loading y Code Splitting

**✅ Decisión: Lazy loading de componentes React**

**Justificación:**
- **Performance**: Carga inicial más rápida
- **Bundle Size**: Chunks más pequeños
- **UX**: Perceived performance mejorada
- **Escalabilidad**: Facilita añadir nuevas funcionalidades

## 7. Decisiones de Testing

### 7.1 Testing Strategy: Pirámide de Testing

**✅ Decisión: Énfasis en tests unitarios + integración**

**Justificación:**
- **Cobertura**: Cumple requisito de 80%
- **Velocidad**: Tests unitarios son rápidos
- **Confiabilidad**: Tests de integración para flujos críticos
- **Mantenibilidad**: Tests fáciles de mantener

### 7.2 Mocking Strategy

**✅ Decisión: Mocking de dependencias externas**

**Justificación:**
- **Aislamiento**: Tests verdaderamente unitarios
- **Velocidad**: No dependen de BD o APIs externas
- **Confiabilidad**: Tests determinísticos
- **CI/CD**: Facilita integración continua

## 8. Decisiones de DevOps

### 8.1 Docker + Docker Compose

**✅ Decisión: Containerización completa**

**Justificación:**
- **Requerimiento**: Especificado en la prueba
- **Consistency**: Mismo ambiente en desarrollo y producción
- **Simplicidad**: One-command deployment
- **Aislamiento**: Dependencias encapsuladas
- **Escalabilidad**: Facilita deployment en cloud

### 8.2 Multi-stage Docker Builds

**✅ Decisión: Builds optimizados para desarrollo y producción**

**Justificación:**
- **Performance**: Imágenes optimizadas
- **Seguridad**: No incluye herramientas de desarrollo en producción
- **Flexibilidad**: Diferentes targets para diferentes ambientes
- **Tamaño**: Imágenes más pequeñas

## 9. Decisiones de Documentación

### 9.1 Swagger/OpenAPI Automático

**✅ Decisión: Documentación automática con decoradores**

**Justificación:**
- **Mantenibilidad**: Documentación siempre actualizada
- **Productividad**: No require documentación manual
- **Testing**: Facilita testing de API
- **Integración**: Permite generar clientes automáticamente

### 9.2 README Detallado + Arquitectura Separada

**✅ Decisión: Documentación en múltiples niveles**

**Justificación:**
- **Usabilidad**: Información por audiencia
- **Onboarding**: Facilita incorporación de nuevos desarrolladores
- **Mantenimiento**: Documentación modular
- **Evaluación**: Cumple criterios de evaluación

## 10. Escalabilidad Futura

### 10.1 Preparación para Microservicios

**✅ Decisión: Arquitectura modular que facilita evolución**

**Justificación:**
- **Future-proof**: Fácil migración a microservicios
- **Flexibilidad**: Módulos independientes
- **Testing**: Facilita testing aislado
- **Team Scaling**: Permite equipos independientes por módulo

### 10.2 API-First Design

**✅ Decisión: API como first-class citizen**

**Justificación:**
- **Integraciones**: Facilita integraciones futuras
- **Mobile**: Preparado para apps móviles
- **Terceros**: API pública para partners
- **Flexibility**: Frontend desacoplado del backend

---

## 11. Notas prácticas y consideraciones sobre el seed

- El repositorio incluye un `SeedsService` ejecutado durante el arranque del backend cuando la variable de entorno `SEED_DB=true`.
- Importante: la implementación actual ejecuta un `TRUNCATE ... RESTART IDENTITY CASCADE` en tablas claves cuando `SEED_DB=true`. Esto es destructivo y está pensado únicamente para entornos de desarrollo o pruebas. No activar `SEED_DB=true` en entornos con datos reales.
- El seed crea: 2 usuarios (admin y user), al menos 3 editoriales (publishers), 6 géneros, múltiples autores y 15 libros con imágenes (subidas a Cloudinary si hay credenciales; en su defecto usa rutas locales montadas desde `./assets/images`).


## 12. Recomendaciones y pasos siguientes

- Mantener la convención actual (módulos) o extraer un `core/` si se desea forzar separación física entre dominio y aplicación.
- Documentar en `ARQUITECTURA.md` las convenciones internas de cada módulo (nombres de carpetas y contratos) si se espera que terceros trabajen en el proyecto.
- Añadir una bandera `FORCE_RESEED=true` separada de `SEED_DB` si se requiere un re-seed intencional sin riesgo de activarlo por error.

---

**Conclusión**: Los documentos se han ajustado para reflejar fielmente la estructura del repositorio y las decisiones implementadas. Se ha añadido una advertencia explícita sobre la naturaleza destructiva del seed cuando `SEED_DB=true`.
