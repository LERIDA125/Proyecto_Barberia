# Tasks — 015-entorno-docker-compose

> **Feature:** Entorno de desarrollo contenedorizado (frontend + backend).
> **Fuentes:** `spec.md`, `plan.md`, `README.md`, `frontend/package.json`, `backend/package.json`, `backend/prisma.config.mjs`.
> **Convención:** `[x]` = respaldado por evidencia verificable; `[ ]` = pendiente o no verificado.

## Fase 1 — Documentación previa

- [x] **T001** Crear `spec.md` con problema, alcance, requisitos y criterios de aceptación.
- [x] **T002** Crear `plan.md` con enfoque técnico, decisiones, riesgos y estrategia de pruebas.
- [x] **T003** Crear este `tasks.md` con tareas atómicas y trazabilidad.

## Fase 2 — Implementación

- [x] **T004** Crear `frontend/Dockerfile.dev` con Node 20, instalación de dependencias y `npm run dev` en el puerto 3001 (FR-015-001, FR-015-002, FR-015-006).
- [x] **T005** Crear `frontend/.dockerignore` excluyendo `node_modules`, `.next`, logs, artefactos y entornos locales (FR-015-005).
- [x] **T006** Crear `backend/Dockerfile.dev` con `openssl`, dependencias y `npm run dev` (FR-015-003, FR-015-006, FR-015-008).
- [x] **T007** Crear `backend/.dockerignore` excluyendo `node_modules`, `data`, logs, `.env` y credenciales (FR-015-005).
- [x] **T008** Crear `docker-compose.yml` con los servicios `frontend` y `backend`, puertos, montajes, volúmenes nombrados, `env_file` opcional, `DATABASE_URL` sobreescribible y `extra_hosts` (FR-015-001, FR-015-002, FR-015-003, FR-015-007, FR-015-008, FR-015-010).
- [x] **T009** Montar `datos_barberia.md` en el backend para el RAG (FR-015-009).
- [x] **T010** Configurar polling de watchers para hot-reload en Windows (FR-015-004).
- [x] **T011** Confirmar que no se modifica código de la aplicación, contratos, esquema Prisma ni scripts de `package.json` (FR-015-011).

## Fase 3 — Verificación

- [x] **T012** Ejecutar `docker compose config` y verificar puertos, volúmenes y red. → finaliza sin errores.
- [x] **T013** Construir y levantar el entorno con `docker compose up -d --build`. → ambos contenedores en estado `Up`.
- [x] **T014** Verificar `GET http://localhost:3001` con estado 2xx (SC-015-002). → HTTP 200.
- [x] **T015** Verificar `GET http://localhost:3000/api/health` con `{ status: "ok" }` (SC-015-003). → `{"status":"ok","servicio":"barberia-api"}`.
- [x] **T016** Verificar hot-reload del frontend sin reconstruir la imagen (SC-015-004). → cambio de texto visible y revertido desde el host.
- [x] **T017** Verificar reinicio automático del backend tras un cambio (SC-015-004). → `nodemon` registró `restarting due to changes`.
- [x] **T018** Verificar que el contexto de build excluye `node_modules` y `.next` (SC-015-005). → contextos de 5.27 kB (frontend) y 4.10 kB (backend).
- [x] **T019** Ejecutar `npm run lint` y `npx tsc --noEmit` en `frontend/` (SC-015-007). → ambos exit 0 (3 warnings preexistentes de lint).
- [x] **T020** Revisar `git status`/`git diff --stat` para confirmar el alcance (SC-015-006).
- [x] **T021** Detener el entorno con `docker compose down`. → red eliminada, volúmenes nombrados conservados.

## Fase 4 — Cierre documental

- [x] **T022** Actualizar `specs/index.md` con la feature 015 y su estado.
- [x] **T023** Actualizar `ESTADO.md` con el resultado real y las limitaciones.
- [x] **T024** Documentar en `README.md` el comando de arranque, puertos y variables sobreescribibles (FR-015-012).
- [x] **T025** Marcar en este archivo solo las tareas con evidencia ejecutada.

## Limitaciones de verificación

- Los flujos dependientes de PostgreSQL no se verificaron: no había un contenedor `barberia-postgres` disponible durante las pruebas. El compose asume PostgreSQL corriendo en el host vía `host.docker.internal:5432`.
- La integración con el MCP de Google Calendar queda fuera del alcance de esta feature.

## Dependencias

- T004-T011 dependen de T001-T003.
- T012-T021 dependen de T004-T011.
- T022-T025 dependen de T012-T021.

## Criterios de finalización

1. `docker compose config` finaliza sin errores.
2. El entorno levanta frontend y backend con un solo comando.
3. El frontend responde en `:3001` y el backend en `:3000/api/health`.
4. Un cambio guardado en cada servicio se refleja sin reconstruir la imagen.
5. `node_modules` y `.next` no entran al contexto de build ni se mezclan con el host.
6. No se modifican código de aplicación, contratos ni scripts.
7. Lint y TypeScript del frontend no reportan errores nuevos.
8. La documentación refleja el resultado real y las limitaciones de verificación.
