# Feature Specification: Entorno de desarrollo contenedorizado (frontend + backend)

**Feature Branch**: `015-entorno-docker-compose`

**Created**: 2026-11-05

**Status**: Implemented

**Verification**: `docker compose config` sin errores; `docker compose up -d --build` levantó ambos servicios; `GET http://localhost:3001` respondió 200 y `GET http://localhost:3000/api/health` respondió `{ "status": "ok", "servicio": "barberia-api" }`; hot-reload del frontend y reinicio de `nodemon` verificados con cambios reales desde el host; contexto de build reducido a 5.27 kB (frontend) y 4.10 kB (backend); lint 0 errores (3 advertencias preexistentes) y TypeScript sin errores. Limitación: no se verificaron flujos que dependen de PostgreSQL porque el contenedor de base de datos no estaba corriendo.

**Input**: User description: "Integrar el frontend al entorno de Docker Compose para dejar de ejecutar `npm run dev` manualmente, manteniendo el hot-reload para desarrollo. Alcance elegido por el usuario: frontend + backend en el compose."

## Problem Statement

Hoy el entorno de desarrollo se levanta a mano: una terminal para el backend (`npm run dev` en `backend/`), otra para el frontend (`npm run dev` en `frontend/`) y un contenedor de PostgreSQL iniciado por separado. No existe un archivo de Compose en el repositorio, por lo que no hay un comando único, reproducible y aislado para levantar la aplicación completa. Las dependencias se instalan en el host y los artefactos de build (`node_modules`, `.next`) quedan mezclados con el código fuente.

## Scope

### In Scope

- Un entorno de desarrollo contenedorizado que levante frontend y backend juntos.
- Recarga en vivo (hot-reload) al guardar archivos desde el host (Windows/VS Code).
- Ajuste mínimo de configuración de Next.js para habilitar polling del watcher solo dentro del contenedor.
- Aislamiento de dependencias y artefactos de build respecto del host.
- Comunicación entre frontend y backend por una red interna compartida.
- Conexión del backend al PostgreSQL que ya corre en el host.
- Documentación mínima de uso (comando de arranque, puertos y variables).

### Out of Scope

- Imágenes de producción, despliegue, CI/CD o publicación.
- Incorporar PostgreSQL al compose (sigue corriendo fuera, como indica el README).
- Incorporar el servidor MCP de Google Calendar al compose.
- Cambios en contratos de API, lógica de negocio, esquema Prisma, rutas o componentes.
- Cambios en los scripts de `package.json` de frontend o backend.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Levantar el entorno con un solo comando (Priority: P1)

Un desarrollador clona el repositorio, prepara su archivo de entorno del backend y ejecuta un único comando para tener frontend y backend disponibles.

**Why this priority**: Es el objetivo central: eliminar el arranque manual en dos terminales.

**Independent Test**: Con Docker en ejecución y PostgreSQL del host levantado, ejecutar el comando de arranque y verificar que el frontend responde en `http://localhost:3001` y el backend en `http://localhost:3000/api/health`.

**Acceptance Scenarios**:

1. **Given** el repositorio sin contenedores de la aplicación, **When** el desarrollador ejecuta el comando de arranque del compose, **Then** los servicios de frontend y backend quedan en ejecución.
2. **Given** ambos servicios en ejecución, **When** se solicita `http://localhost:3001`, **Then** el frontend responde con la aplicación.
3. **Given** ambos servicios en ejecución, **When** se solicita `http://localhost:3000/api/health`, **Then** el backend responde `{ status: "ok" }`.
4. **Given** un puerto del host ocupado, **When** se intenta levantar el entorno, **Then** el error de Compose identifica el puerto en conflicto y no se presenta como un arranque exitoso.

---

### User Story 2 - Hot-reload al guardar desde Windows (Priority: P1)

Un desarrollador edita un archivo del frontend o del backend en VS Code y ve el cambio reflejado sin reconstruir la imagen ni reiniciar el contenedor.

**Why this priority**: Sin recarga en vivo el entorno contenedorizado no sirve para desarrollo.

**Independent Test**: Con el entorno levantado, modificar un texto visible del frontend y guardar; verificar que el navegador refleja el cambio. Repetir con un archivo del backend y verificar el reinicio de `nodemon`.

**Acceptance Scenarios**:

1. **Given** el entorno en ejecución, **When** se guarda un cambio en un componente del frontend, **Then** Next.js recompila y el navegador muestra el cambio sin reiniciar el contenedor.
2. **Given** el entorno en ejecución, **When** se guarda un cambio en un archivo del backend, **Then** `nodemon` reinicia el proceso y el cambio queda activo.
3. **Given** un cambio guardado, **When** se inspecciona el contenedor, **Then** el archivo modificado es el del host (montaje), no una copia de la imagen.

---

### User Story 3 - Dependencias y artefactos aislados (Priority: P2)

Un desarrollador alterna entre ejecutar la app en el host y en contenedores sin que las dependencias de una plataforma pisen a las de la otra.

**Why this priority**: Evita fallos por binarios nativos de Windows/Linux y mantiene limpio el contexto de build.

**Independent Test**: Verificar que el contexto de build no incluye `node_modules` ni `.next`, y que el contenedor usa sus propias dependencias.

**Acceptance Scenarios**:

1. **Given** el directorio del frontend con `node_modules` y `.next` del host, **When** se construye la imagen, **Then** esos directorios no se copian al contexto de build.
2. **Given** el contenedor en ejecución, **When** se inspecciona `/app/node_modules`, **Then** contiene las dependencias instaladas para Linux y no las del host.
3. **Given** el contenedor en ejecución, **When** se inspecciona `/app/.next`, **Then** los artefactos de desarrollo del contenedor no sobrescriben los del host.

---

### Edge Cases

- **PostgreSQL no está corriendo**: el backend arranca pero las consultas fallan; el error debe ser visible en los logs y no debe impedir que el frontend sirva la interfaz.
- **`backend/.env` no existe**: el compose no debe fallar por un archivo de entorno ausente; el backend usa sus valores por defecto de desarrollo y advierte por `SESSION_SECRET`.
- **Credenciales de PostgreSQL distintas a las del README**: el desarrollador debe poder sobreescribir la URL de conexión sin editar el compose.
- **Cambio de dependencias**: tras modificar un `package.json`, el desarrollador debe poder sincronizar dependencias sin borrar volúmenes a ciegas.
- **Puerto ocupado**: el conflicto se reporta y no se simula un arranque correcto.
- **Archivo `datos_barberia.md`**: el backend debe poder leerlo dentro del contenedor para el RAG.
- **Hot-reload que no dispara**: debe existir una alternativa de polling documentada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-015-001**: El sistema MUST ofrecer un comando único que levante frontend y backend en contenedores.
- **FR-015-002**: El frontend MUST quedar accesible desde el host en el puerto `3001`, coherente con el script de desarrollo actual.
- **FR-015-003**: El backend MUST quedar accesible desde el host en el puerto `3000`, coherente con `NEXT_PUBLIC_API_URL` y la configuración CORS actual.
- **FR-015-004**: Los cambios en archivos del host MUST reflejarse en los contenedores sin reconstruir la imagen (hot-reload en frontend y reinicio automático en backend).
- **FR-015-005**: El contexto de build MUST excluir `node_modules`, `.next`, logs, artefactos de TypeScript y archivos de entorno con secretos.
- **FR-015-006**: Las dependencias MUST instalarse dentro de cada contenedor y MUST NOT depender de las instaladas en el host.
- **FR-015-007**: Frontend y backend MUST compartir una red interna nombrada; el frontend MUST declarar dependencia de inicio del backend.
- **FR-015-008**: El backend MUST conservar sus variables de entorno y MUST poder alcanzar el PostgreSQL del host.
- **FR-015-009**: El backend MUST poder leer `datos_barberia.md` dentro del contenedor.
- **FR-015-010**: El compose MUST NOT requerir la existencia de `backend/.env` para iniciar; si existe, MUST cargarlo.
- **FR-015-011**: El cambio MUST NOT modificar contratos de API, lógica de negocio, esquema Prisma, rutas, componentes ni scripts de la aplicación.
- **FR-015-012**: La documentación del proyecto MUST indicar el comando de arranque, los puertos y las variables que el desarrollador puede sobreescribir.

### Key Entities

- **Servicio de desarrollo**: proceso contenedorizado (frontend o backend) con su puerto, variables, montajes y red.
- **Volumen de dependencias**: almacenamiento separado para `node_modules` y artefactos de build, para no mezclar plataformas.
- **Red compartida**: red interna que permite resolver el backend por nombre de servicio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-015-001**: La validación de configuración del compose finaliza sin errores.
- **SC-015-002**: El comando de arranque deja ambos servicios en ejecución y `http://localhost:3001` responde con estado 2xx.
- **SC-015-003**: `http://localhost:3000/api/health` responde `{ status: "ok" }` con estado 2xx.
- **SC-015-004**: El 100% de los cambios de prueba guardados en frontend y backend se reflejan sin reconstruir la imagen.
- **SC-015-005**: El contexto de build de frontend y backend no incluye `node_modules` ni `.next`.
- **SC-015-006**: No se modifica ningún archivo de código de la aplicación ni de los scripts de `package.json`.
- **SC-015-007**: Lint y TypeScript del frontend siguen sin errores nuevos.

## Assumptions

- El desarrollador usa Docker Desktop con Docker Compose v2 o superior en Windows.
- PostgreSQL corre en el host en el puerto `5432` con las credenciales del README (`usuario` / `password` / base `barberia`), salvo que se sobreescriba la URL.
- `backend/.env` existe en el entorno local y contiene los secretos reales; no se versiona.
- Los puertos `3000` y `3001` del host están libres.
- El servidor MCP de Google Calendar no forma parte de esta feature; si no está corriendo, la integración queda deshabilitada sin bloquear el arranque.
- No se requiere una imagen de producción en esta feature.
- El hot-reload del frontend en Windows requiere polling porque Turbopack no recibe eventos del bind mount; se habilita solo con `NEXT_WATCH_POLL=true` y no afecta el `npm run dev` del host.

## Amendment — 2026-11-05: PostgreSQL en Compose y observabilidad

**Motivo:** el alcance original dejaba PostgreSQL fuera del compose y, al no haber una base corriendo, todas las rutas dependientes de persistencia devolvían `500 Error interno del servidor` sin causa visible.

**Cambios de alcance (supersede los "Out of Scope" originales):**

- El compose incorpora el servicio `postgres` (`postgres:16-alpine`) con credenciales `usuario`/`password`/`barberia`, puerto `5432`, volumen `postgres_data` y healthcheck `pg_isready`.
- El backend depende de `postgres` con `condition: service_healthy` y usa `postgresql://usuario:password@postgres:5432/barberia?schema=public`.
- `error.middleware.js` desenmascara errores de infraestructura de Prisma: `P1001/P1002/P1017` → `503 Base de datos no disponible`; `P2021` → `500` con mensaje de migraciones faltantes.
- `/api/health` ejecuta `SELECT 1` y responde `503` cuando la base no está disponible.

**Criterios de aceptación agregados:**

- **AC-015-A1:** `docker compose up -d` deja `postgres` saludable antes de arrancar el backend.
- **AC-015-A2:** `GET /api/health` responde `200` con `db: "ok"` cuando la base está arriba.
- **AC-015-A3:** con la base caída, `/api/health` y las rutas de datos responden `503` con mensaje explícito (nunca el genérico `Error interno del servidor`).
- **AC-015-A4:** con las tablas ausentes, la API responde `500` indicando que faltan migraciones.

**Verificación:** `docker compose config` OK; `migrate deploy` y `seed` aplicados dentro del contenedor; `/api/health` → `200 {"db":"ok"}`; `/api/servicios` → `200` con 4 servicios; con `postgres` detenido, `/api/health` → `503 {"db":"down"}` y `/api/servicios` → `503 {"message":"Base de datos no disponible"}`; al reiniciar `postgres`, ambos vuelven a `200`.

**Limitación:** migraciones y seed se corren a mano; el MCP de Google Calendar sigue fuera del compose (no tiene Dockerfile).
