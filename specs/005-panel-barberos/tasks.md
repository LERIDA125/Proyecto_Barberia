# Tasks — 005-panel-barberos

> **Feature:** Panel de Barberos (CU-05)
> **Fuentes:** `spec.md`, `plan.md`, `backend/src/services/barberos.service.js`, `backend/src/controllers/barberos.controller.js`, `backend/src/routes/barberos.routes.js`, `backend/src/services/turnos.service.js`, `frontend/src/app/panel/`, `frontend/src/components/panel/`, `ESTADO.md`.
> **Convención:** `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.
> **Nota:** backfill documental posterior al desarrollo. La UI real vive en `app/panel` y `components/panel`, no en `app/barberos` como proponía el plan.

## Fase 1 — Preparación y configuración

- [x] **T001** Definir los contratos de agenda, disponibilidad y métricas en `plan.md`.
- [x] **T002** Definir las transiciones válidas de estado (`pendiente → confirmado → completado`; `cancelado` desde `pendiente`/`confirmado`).
- [x] **T003** Definir la validación de horario (`inicio < fin`) y días laborales (subconjunto 0–6) (FR-006).
- [x] **T004** Definir las reglas de permisos: barbero asignado, admin y consulta de agenda ajena (FR-004, FR-008).

## Fase 2 — Implementación

- [x] **T005** Implementar `GET /api/barberos/me/agenda` con rango `desde`/`hasta` en `backend/src/services/barberos.service.js` (FR-001).
- [x] **T006** Implementar `GET /api/barberos/:id/agenda` para admin (FR-008).
- [x] **T007** Incluir cliente y servicio en la agenda (FR-009).
- [x] **T008** Implementar `PATCH /api/turnos/:id/estado` con permiso del barbero asignado o admin (FR-002, FR-004).
- [x] **T009** Rechazar transiciones inválidas con `409` (FR-003).
- [x] **T010** Implementar `GET /api/barberos/me/disponibilidad` (FR-005).
- [x] **T011** Implementar `PUT /api/barberos/me/disponibilidad` con validación de horario y días (FR-005, FR-006).
- [x] **T012** Implementar `GET /api/barberos/me/metricas` con turnos, completados y cancelados (FR-007).
- [x] **T013** Implementar `GET /api/barberos/:id/metricas` para admin (FR-008).
- [x] **T014** Implementar bloqueos de agenda: `GET/POST /api/barberos/me/bloqueos` y `DELETE /api/barberos/me/bloqueos/:id`.
- [x] **T015** Excluir bloqueos de la disponibilidad y de la creación de turnos. Evidencia: `backend/src/services/barberos.service.js` y `backend/src/services/turnos.service.js`.
- [x] **T016** Implementar la página del panel en `frontend/src/app/panel/page.tsx`.
- [x] **T017** Implementar `TurnoPanelCard` en `frontend/src/components/panel/TurnoPanelCard.tsx`.
- [x] **T018** Implementar `TurnoHistorialCard` en `frontend/src/components/panel/TurnoHistorialCard.tsx`.
- [x] **T019** Implementar `BloqueosManager` en `frontend/src/components/panel/BloqueosManager.tsx`.
- [x] **T020** Implementar `FichaCliente` en `frontend/src/components/panel/FichaCliente.tsx`.
- [x] **T021** Implementar `EstadoBadge` en `frontend/src/components/ui/EstadoBadge.tsx`.
- [x] **T022** Implementar `Skeleton` en `frontend/src/components/ui/Skeleton.tsx` para estados de carga.
- [ ] **T023** Implementar `AgendaDia` en `frontend/src/components/barberos/AgendaDia.tsx`. No existe; verificar si la agenda diaria está embebida en `app/panel/page.tsx`.
- [ ] **T024** Implementar `AgendaSemana` en `frontend/src/components/barberos/AgendaSemana.tsx`. No existe; verificar si la vista semanal está embebida.
- [ ] **T025** Implementar `DisponibilidadForm` en `frontend/src/components/barberos/DisponibilidadForm.tsx`. No existe con ese nombre; verificar el formulario real.
- [ ] **T026** Implementar `MetricasResumen` en `frontend/src/components/barberos/MetricasResumen.tsx`. No existe con ese nombre; verificar dónde se renderizan las métricas.
- [ ] **T027** Documentar y justificar los bloqueos de agenda como funcionalidad implementada no prevista explícitamente en `spec.md`.

## Fase 3 — Integración

- [x] **T028** Conectar la agenda con `GET /api/barberos/me/agenda`.
- [x] **T029** Conectar los cambios de estado con `PATCH /api/turnos/:id/estado`.
- [x] **T030** Conectar la edición de disponibilidad con `PUT /api/barberos/me/disponibilidad`.
- [x] **T031** Conectar métricas y bloqueos con sus endpoints.
- [x] **T032** Ocultar acciones de estado no válidas según la transición actual.
- [ ] **T033** Verificar que un cambio de horario se refleje en la disponibilidad pública de la siguiente consulta (SC-005).
- [ ] **T034** Verificar el panel completo con sesión real de barbero y turnos asignados (SC-001, SC-006).
- [ ] **T035** Verificar que un barbero no pueda modificar turnos ajenos desde la UI y que la API responda `403` (SC-004).

## Fase 4 — Pruebas

- [ ] **T036** Crear tests de agenda: propia, ajena como admin, rango vacío y datos de cliente/servicio.
- [ ] **T037** Crear tests de transiciones válidas e inválidas (`409`).
- [ ] **T038** Crear tests de permisos sobre turnos ajenos (`403`).
- [ ] **T039** Crear tests de disponibilidad: horario inválido, días inválidos, actualización correcta y efecto en la disponibilidad.
- [ ] **T040** Crear tests de métricas por período y de bloqueos.
- [ ] **T041** Agregar al menos un test de caso feliz y uno de error por endpoint (SC-007).

## Fase 5 — Documentación

- [x] **T042** Documentar `spec.md` y `plan.md`.
- [x] **T043** Registrar el estado de la feature en `ESTADO.md`.
- [x] **T044** Crear este `tasks.md` como backfill.
- [ ] **T045** Corregir en `plan.md` las rutas de UI propuestas (`app/barberos`, `components/barberos`) frente a la implementación real (`app/panel`, `components/panel`).

## Dependencias

- T005-T015 dependen de T001-T004.
- T016-T027 dependen de T005-T015.
- T028-T035 dependen de T016-T027.
- T036-T041 dependen de T028-T035.

## Criterios de finalización

1. El barbero ve su agenda diaria/semanal con cliente y servicio.
2. Solo puede modificar sus propios turnos.
3. Las transiciones inválidas se rechazan con `409` y se ocultan en la UI.
4. El horario y los días laborales se validan y afectan la disponibilidad.
5. Las métricas básicas se muestran sin errores.
6. Cada endpoint tiene al menos un test de caso feliz y uno de error.
7. Las diferencias entre `plan.md` y la UI real están documentadas.
