# Tasks — 000-arquitectura

> **Feature:** Arquitectura del Sistema de Barbería
> **Fuentes:** `spec.md`, `plan.md`, estructura real del repositorio y `ESTADO.md`.
> **Convención:** `[x]` = respaldado por evidencia de implementación o documentación; `[ ]` = pendiente o no verificado.
> **Nota:** documentación reconstruida después del desarrollo. No implica que Spec Kit se haya usado desde el inicio; el historial Git muestra que las specs se incorporaron el 2026-10-20, después de los primeros commits de código (2026-10-09/10).

## Fase 1 — Preparación y decisiones

- [x] **T001** Definir las cuatro capas (presentación, aplicación/API, dominio IA, integración/datos) y sus responsabilidades en `plan.md` §1.1.
- [x] **T002** Documentar los principios de separación de capas, contratos primero, chatbot sin lógica propia e integraciones desacopladas en `plan.md` §1.1.
- [x] **T003** Definir el modelo de datos de `Usuario`, `Barbero`, `Servicio`, `Turno` y `CredencialPasskey` en `plan.md` §2.
- [x] **T004** Documentar las relaciones y cardinalidades principales en `plan.md` §2.2.
- [x] **T005** Documentar las reglas de integridad de alto nivel (sin solapes, duración derivada del servicio, email único, borrado lógico) en `plan.md` §2.3.
- [x] **T006** Registrar las decisiones y trade-offs sobre MCP PostgreSQL, Google Calendar vía MCP y chatbot que reutiliza servicios en `plan.md` §1.4.
- [x] **T007** Verificar la constitución del proyecto y dejar el `Constitution Check` en `plan.md`.
- [ ] **T008** Reconciliar el árbol de carpetas del `plan.md` con la estructura real: el backend usa JavaScript y rutas/controllers en `backend/src/`, no `backend/src/api/` ni archivos `.ts`. Documentar la diferencia.

## Fase 2 — Implementación de la base arquitectónica

- [x] **T009** Crear el frontend Next.js con App Router en `frontend/src/app/`.
- [x] **T010** Crear el backend Node.js con Express en `backend/src/app.js` y `backend/server.js`.
- [x] **T011** Implementar la separación rutas → controllers → services en `backend/src/routes/`, `backend/src/controllers/` y `backend/src/services/`.
- [x] **T012** Implementar el acceso a datos con Prisma en `backend/prisma/schema.prisma` y `backend/src/config/prisma.js`.
- [x] **T013** Implementar el agente LangChain y sus tools en `backend/src/agent/`.
- [x] **T014** Implementar el cliente y los servidores MCP en `backend/src/mcp/`.
- [x] **T015** Crear la estructura documental `specs/NNN-nombre/` con `spec.md` y `plan.md` para las 13 features.
- [x] **T016** Documentar la estructura real de `docs/` y `chatbot-rag/` en el repositorio.
- [ ] **T017** Implementar un módulo `backend/src/api/` separado, tal como lo propone el `plan.md`. La implementación actual no lo usa; la decisión pendiente es actualizar el plan o migrar la estructura.

## Fase 3 — Integración entre capas

- [x] **T018** Verificar que el frontend consuma la API REST y no acceda directamente a PostgreSQL (FR-001, SC-002). Evidencia: cliente HTTP en `frontend/src/lib/api/` y servicios de backend.
- [x] **T019** Verificar que el chatbot delegue en los servicios de negocio y no duplique reglas (FR-003, SC-003). Evidencia: `backend/src/agent/tools.js` y `backend/src/services/asistente.service.js`.
- [x] **T020** Verificar que PostgreSQL y Google Calendar se accedan únicamente desde `backend/src/mcp/` (FR-004).
- [x] **T021** Verificar que la duración del turno se derive de `Servicio.duracionMin` y que exista control de solapes por barbero (FR-006). Evidencia: `backend/src/services/turnos.service.js`.
- [x] **T022** Verificar el borrado lógico de servicios y barberos mediante el campo `activo` (FR-007).
- [x] **T023** Verificar la identidad y los permisos por rol (`cliente`, `barbero`, `admin`) en `backend/src/middlewares/auth.middleware.js` y en los services (FR-008).
- [x] **T024** Verificar el vínculo `Turno.googleEventId` con la agenda externa (FR-009). Evidencia: modelo Prisma y `backend/src/services/integraciones.service.js`.
- [ ] **T025** Verificar end-to-end el flujo registro → reserva → atención → métricas (SC-001). No hay smoke test ejecutado con resultado persistido.

## Fase 4 — Pruebas

- [ ] **T026** Ejecutar `node --check` sobre los archivos backend modificados o representativos y registrar el resultado.
- [ ] **T027** Ejecutar `npx tsc --noEmit` en `frontend/` y registrar el resultado.
- [ ] **T028** Ejecutar `npm run lint` en `frontend/` y registrar el resultado. Evidencia previa: falla por `react-hooks/set-state-in-effect` en `Footer.tsx:18`.
- [ ] **T029** Verificar con una prueba automatizada que no existan solapamientos por barbero (SC-004). La lógica existe, pero no hay prueba específica de solape ejecutada.
- [ ] **T030** Verificar que la desactivación de servicios/barberos preserve el historial de turnos (SC-005).
- [ ] **T031** Verificar que una falla de Google Calendar no bloquee la persistencia del turno (SC-006).
- [ ] **T032** Documentar la matriz de cobertura de pruebas por capa; hoy solo existen `backend/src/tests/auth.test.js` y `backend/src/tests/turnos.test.js`.

## Fase 5 — Documentación y trazabilidad

- [x] **T033** Crear `README.md` con arquitectura, stack, casos de uso y guía de ejecución.
- [x] **T034** Crear `ESTADO.md` con la auditoría de estado por feature y la deuda técnica.
- [x] **T035** Crear `AGENTS.md`, `.instructions.md` y `.specify/memory/constitution.md`.
- [x] **T036** Crear `docs/sdd/ESTADO_DOCUMENTACION_SDD.md` con el inventario documental.
- [x] **T037** Crear este `tasks.md` como backfill documental.
- [ ] **T038** Actualizar `specs/index.md` para enlazar los `tasks.md` y corregir la nota de "no backfill".
- [ ] **T039** Reconciliar `README.md` con `ESTADO.md`: no afirmar que todos los CU están funcionales mientras 006-010 sean parciales.

## Dependencias

- T009-T016 dependen de T001-T007.
- T018-T025 dependen de T009-T016.
- T026-T032 dependen de T018-T025.
- T038-T039 dependen de que existan los 13 `tasks.md`.

## Criterios de finalización

1. Las capas y el modelo de datos del `plan.md` coinciden con la implementación o la diferencia está documentada.
2. No existe acceso directo del frontend a PostgreSQL ni del chatbot a reglas duplicadas.
3. Las reglas de integridad (solapes, duración, borrado lógico, `googleEventId`) tienen evidencia en código.
4. Las pruebas pendientes están marcadas `[ ]` y no se presentan como aprobadas.
5. `specs/index.md` y `README.md` reflejan el estado real.
