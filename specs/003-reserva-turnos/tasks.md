# Tasks — 003-reserva-turnos

> **Feature:** Reserva de Turnos (CU-03)
> **Fuentes:** `spec.md`, `plan.md`, `backend/src/services/turnos.service.js`, `backend/src/controllers/turnos.controller.js`, `backend/src/routes/turnos.routes.js`, `backend/src/agent/tools.js`, `frontend/src/app/reservar/`, `frontend/src/components/reservar/`, `ESTADO.md`.
> **Convención:** `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.
> **Nota:** backfill documental posterior al desarrollo. El `plan.md` menciona una verificación en vivo, pero no hay un artefacto de prueba reproducible adjunto.

## Fase 1 — Preparación y configuración

- [x] **T001** Definir el modelo `Turno` con `clienteId`, `barberoId`, `servicioId`, `fechaInicio`, `fechaFin`, `estado`, `notas` y `googleEventId` en `backend/prisma/schema.prisma`.
- [x] **T002** Definir los contratos de disponibilidad y creación de turno en `plan.md`.
- [x] **T003** Definir las reglas de negocio: fecha futura, duración derivada del servicio, horario laboral, sin solapes y estado inicial `confirmado` (FR-002 a FR-008).
- [x] **T004** Definir los estados válidos del turno en `backend/src/services/barberos.service.js` (`ESTADOS`) y las transiciones en `backend/src/services/turnos.service.js`.
- [x] **T005** Definir la dependencia con CU-06 para la reserva por lenguaje natural (FR-009) y documentarla en `plan.md`.

## Fase 2 — Implementación

- [x] **T006** Implementar `GET /api/barberos` para listar barberos activos en `backend/src/controllers/barberos.controller.js` (FR-001).
- [x] **T007** Implementar `GET /api/barberos/:id/disponibilidad` con `fecha` y `servicioId` opcional en `backend/src/services/barberos.service.js` (FR-003).
- [x] **T008** Excluir de la disponibilidad los turnos ocupados (`pendiente`/`confirmado`) y los bloqueos (FR-003).
- [x] **T009** Implementar `POST /api/turnos` con `requiereAuth` en `backend/src/routes/turnos.routes.js` (FR-001, FR-010).
- [x] **T010** Resolver `clienteId` propio o el enviado por admin en `backend/src/controllers/turnos.controller.js`.
- [x] **T011** Validar campos, UUIDs, fecha futura, servicio/barbero/cliente existentes y activos en `backend/src/services/turnos.service.js` (FR-005, FR-007).
- [x] **T012** Calcular `fechaFin = fechaInicio + servicio.duracionMin` (FR-002).
- [x] **T013** Validar el horario y los días laborales del barbero (FR-006).
- [x] **T014** Crear el turno dentro de `prisma.$transaction` con chequeo de solapamiento y respuesta `409` (FR-004).
- [x] **T015** Persistir el turno en estado `confirmado` (FR-008).
- [x] **T016** Implementar `GET /api/turnos/:id` con control de dueño/admin/barbero en `backend/src/services/turnos.service.js`.
- [x] **T017** Implementar `ReservarWizard` en `frontend/src/app/reservar/page.tsx`.
- [x] **T018** Implementar `StepServicio`, `StepBarbero`, `StepFechaHora` y `StepConfirmacion` en `frontend/src/components/reservar/`.
- [x] **T019** Implementar `Stepper` en `frontend/src/components/ui/Stepper.tsx`.
- [x] **T020** Implementar `SelectorFranjas` y `OpcionSeleccionable` en `frontend/src/components/reservar/`.
- [x] **T021** Implementar `ReservaExitosa` en `frontend/src/components/reservar/ReservaExitosa.tsx` (FR-011).
- [x] **T022** Implementar la tool `reservar_turno` en `backend/src/agent/tools.js` (FR-009).
- [x] **T023** Implementar el `ChatWidget` en `frontend/src/components/chat/ChatWidget.tsx` y montarlo en `frontend/src/app/layout.tsx`.
- [ ] **T024** Verificar que la tool `reservar_turno` aplique exactamente las mismas validaciones que `POST /api/turnos` (FR-009, SC-005).

## Fase 3 — Integración

- [x] **T025** Conectar el wizard con `GET /api/barberos`, `GET /api/barberos/:id/disponibilidad`, `GET /api/servicios` y `POST /api/turnos`.
- [x] **T026** Mostrar estados de carga, sin disponibilidad y error de solapamiento en la UI.
- [x] **T027** Crear notificaciones de alta para cliente y barbero dentro de la transacción de reserva. Evidencia: `backend/src/services/turnos.service.js`.
- [x] **T028** Integrar la creación de eventos de Google Calendar de forma resiliente cuando la integración está configurada. Evidencia: `backend/src/services/integraciones.service.js`.
- [ ] **T029** Verificar el flujo completo de UI: servicio → barbero → fecha/hora → confirmación, con sesión real (SC-001).
- [ ] **T030** Verificar en ejecución que dos reservas concurrentes de la misma franja produzcan un solo turno y un `409` (SC-002, SC-003).
- [ ] **T031** Verificar que la reserva por chat cree el turno con la misma validación que la API (SC-005).

## Fase 4 — Pruebas

- [x] **T032** Implementar `backend/src/tests/turnos.test.js` con 4 casos de autorización/IDOR.
- [x] **T033** Ejecutar `npm test` y confirmar los 4 tests de turnos en verde. Evidencia: suite total `8/8` en verde (ver `ESTADO.md`).
- [ ] **T034** Agregar tests de creación feliz de turno (`201`, estado `confirmado`).
- [ ] **T035** Agregar tests de solapamiento (`409`), fecha pasada (`400`), fuera de horario (`422`) y servicio/barbero inactivo (`400`/`404`).
- [ ] **T036** Agregar tests de disponibilidad: franjas libres, exclusión de ocupados y exclusión de bloqueos.
- [ ] **T037** Agregar un test de concurrencia o de doble reserva de la misma franja (SC-002).
- [ ] **T038** Verificar que cada endpoint tenga al menos un caso feliz y uno de error (SC-006).

## Fase 5 — Documentación

- [x] **T039** Documentar `spec.md` y `plan.md`.
- [x] **T040** Registrar el estado de la feature en `ESTADO.md`.
- [x] **T041** Crear este `tasks.md` como backfill.
- [ ] **T042** Adjuntar evidencia reproducible de la verificación en vivo mencionada en `plan.md` (comando, request/response o log).

## Dependencias

- T006-T016 dependen de T001-T005.
- T017-T023 dependen de T006-T016.
- T025-T031 dependen de T017-T023.
- T034-T038 dependen de T025-T031.

## Criterios de finalización

1. La reserva valida fecha futura, horario, servicio/barbero/cliente activo y solapes.
2. La duración del turno se deriva del servicio.
3. La creación es transaccional y responde `409` ante conflicto.
4. El wizard y el chatbot usan el mismo contrato y las mismas reglas.
5. Las pruebas de caso feliz, solape, fecha pasada y fuera de horario existen y se ejecutaron.
6. No se afirma la verificación en vivo sin evidencia adjunta.
