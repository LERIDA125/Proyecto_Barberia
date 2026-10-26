# Tasks — 004-gestion-turnos-cliente

> **Feature:** Gestión de Turnos del Cliente (CU-04)
> **Fuentes:** `spec.md`, `plan.md`, `backend/src/services/turnos.service.js`, `backend/src/controllers/turnos.controller.js`, `backend/src/routes/turnos.routes.js`, `frontend/src/app/mis-turnos/`, `frontend/src/components/turnos/`, `ESTADO.md`.
> **Convención:** `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.
> **Nota:** backfill documental posterior al desarrollo.

## Fase 1 — Preparación y configuración

- [x] **T001** Definir los contratos de listado, detalle, cancelación y reprogramación en `plan.md`.
- [x] **T002** Definir las reglas de propiedad: dueño, admin y barbero según corresponda (FR-002).
- [x] **T003** Definir las transiciones válidas de estado en `backend/src/services/turnos.service.js` (`TRANSICIONES_VALIDAS`).
- [x] **T004** Definir la ventana mínima de cancelación como parámetro configurable `VENTANA_CANCELACION_HORAS` en `backend/src/config/env.js` (`FR-008`).
- [x] **T005** Definir la dependencia con CU-07 para reflejar cancelación/reprogramación en Google Calendar (FR-007).

## Fase 2 — Implementación

- [x] **T006** Implementar `GET /api/turnos` con filtros `estado`, `desde` y `hasta` en `backend/src/services/turnos.service.js` (FR-001).
- [x] **T007** Restringir el listado de clientes a sus propios turnos y permitir al admin ver todos (FR-002).
- [x] **T008** Implementar `GET /api/turnos/:id` con `verificarPropietario` (FR-002).
- [x] **T009** Implementar `PATCH /api/turnos/:id/cancelar` en `backend/src/controllers/turnos.controller.js` (FR-003).
- [x] **T010** Rechazar cancelación de turnos `completado`, `cancelado` o ya pasados con `409` (FR-004).
- [x] **T011** Aplicar la ventana mínima de cancelación con `422` (FR-008).
- [x] **T012** Implementar `PATCH /api/turnos/:id/reprogramar` con validación de disponibilidad, horario y solape (FR-005, FR-006).
- [x] **T013** Rechazar reprogramación de turnos `completado`, `cancelado` o ya pasados con `409` (FR-004).
- [x] **T014** Implementar `PATCH /api/turnos/:id/estado` con transiciones válidas para barbero/admin.
- [x] **T015** Implementar `PATCH /api/turnos/:id/notas` para observaciones de ficha.
- [x] **T016** Crear notificaciones de cancelación y reprogramación para cliente y barbero (FR-007).
- [x] **T017** Invocar la sincronización con Google Calendar en cancelación y reprogramación cuando la integración está activa (FR-007).
- [x] **T018** Implementar la página `frontend/src/app/mis-turnos/page.tsx` con próximos e históricos (FR-001).
- [x] **T019** Implementar `TurnoCard` en `frontend/src/components/turnos/TurnoCard.tsx`.
- [x] **T020** Implementar `CancelarTurnoDialog` en `frontend/src/components/turnos/CancelarTurnoDialog.tsx`.
- [x] **T021** Implementar `ReprogramarDialog` en `frontend/src/components/turnos/ReprogramarDialog.tsx`.
- [x] **T022** Implementar `EstadoBadge` en `frontend/src/components/ui/EstadoBadge.tsx`.
- [x] **T023** Implementar `EmptyState` en `frontend/src/components/ui/EmptyState.tsx`.
- [ ] **T024** Implementar `TurnoDetalle` en `frontend/src/components/turnos/TurnoDetalle.tsx`. No existe con ese nombre; verificar si el detalle está embebido en la página o en `TurnoCard`.

## Fase 3 — Integración

- [x] **T025** Conectar “Mis turnos” con `GET /api/turnos` y mostrar solo los turnos del usuario.
- [x] **T026** Deshabilitar acciones de cancelar/reprogramar según el estado del turno y la anticipación.
- [x] **T027** Reutilizar la disponibilidad de CU-03 en `ReprogramarDialog`.
- [x] **T028** Mostrar feedback de `409`, `422` y `403` en la UI.
- [x] **T029** Refrescar listado y estado tras cancelar o reprogramar.
- [ ] **T030** Verificar el flujo completo de UI con sesión real: listado, cancelación y reprogramación (SC-001, SC-002, SC-005).
- [ ] **T031** Verificar en ejecución que un cliente no pueda ver ni operar turnos ajenos (SC-004).
- [ ] **T032** Verificar en ejecución la sincronización de cancelación/reprogramación con Google Calendar (FR-007). Hoy no hay evidencia de una llamada real exitosa.

## Fase 4 — Pruebas

- [x] **T033** Implementar `backend/src/tests/turnos.test.js` con 4 casos de autorización/IDOR.
- [x] **T034** Ejecutar `npm test` y confirmar los 4 tests de turnos en verde. Evidencia: suite total `8/8` en verde (ver `ESTADO.md`).
- [ ] **T035** Agregar tests de listado propio, separación próximos/históricos y filtros por estado/fecha.
- [ ] **T036** Agregar tests de cancelación feliz, cancelación de turno completado/cancelado (`409`) y ventana mínima (`422`).
- [ ] **T037** Agregar tests de reprogramación feliz, franja ocupada (`409`) y fuera de horario (`422`).
- [ ] **T038** Agregar tests de acceso a turno ajeno para detalle, cancelación y reprogramación (`403`/`404`).
- [ ] **T039** Agregar al menos un test de caso feliz y uno de error por endpoint (SC-006).

## Fase 5 — Documentación

- [x] **T040** Documentar `spec.md` y `plan.md`.
- [x] **T041** Registrar el estado de la feature en `ESTADO.md`.
- [x] **T042** Crear este `tasks.md` como backfill.
- [ ] **T043** Documentar en `plan.md` que `TurnoDetalle` no se implementó como componente separado, si se confirma.

## Dependencias

- T006-T017 dependen de T001-T005.
- T018-T024 dependen de T006-T017.
- T025-T032 dependen de T018-T024.
- T035-T039 dependen de T025-T032.

## Criterios de finalización

1. El cliente ve exclusivamente sus turnos, separados en próximos e históricos.
2. Cancelar un turno `pendiente`/`confirmado` lo pasa a `cancelado`.
3. No se puede cancelar/reprogramar un turno `completado` o `cancelado`.
4. Las operaciones sobre turnos ajenos se rechazan.
5. La reprogramación valida disponibilidad y horario.
6. La ventana mínima de cancelación es configurable.
7. Cada endpoint tiene al menos un test de caso feliz y uno de error.
8. La sincronización con Calendar se marca verificada solo con evidencia real.
