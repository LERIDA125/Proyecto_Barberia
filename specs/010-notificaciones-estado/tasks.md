# Tasks — 010-notificaciones-estado

> **Feature:** Notificaciones de Estado de Turno (CU-10)
> **Fuentes:** `spec.md`, `plan.md`, `backend/src/services/notificaciones.service.js`, `backend/src/controllers/notificaciones.controller.js`, `backend/src/routes/notificaciones.routes.js`, `backend/prisma/schema.prisma`, `frontend/src/components/layout/NotificationBell.tsx`, `frontend/src/lib/hooks/useNotificaciones.ts`, `ESTADO.md`.
> **Convención:** `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.
> **Nota:** la spec declara `Status: Implemented`, pero **no existen preferencias de notificación, email, recordatorios, job de recordatorios ni idempotencia**. Solo existen notificaciones internas y la campana. El estado correcto es `Partial`.

## Fase 1 — Preparación y configuración

- [x] **T001** Definir el modelo `Notificacion` con `usuarioId`, `titulo`, `mensaje`, `leida`, `turnoId?` y `createdAt` en `backend/prisma/schema.prisma`.
- [x] **T002** Definir los contratos de listado y marcado como leídas en `plan.md`.
- [x] **T003** Definir la regla de notificar a cliente y barbero en alta, reprogramación y cancelación (FR-001).
- [ ] **T004** Definir el modelo `PreferenciaNotificacion` con `email`, `recordatorios` y `horasAntes`. No existe en el schema.
- [ ] **T005** Definir el proveedor de email y las variables de entorno asociadas.
- [ ] **T006** Definir el mecanismo/job de recordatorios y su programación.
- [ ] **T007** Definir la estrategia de idempotencia por `turnoId` + tipo de evento (FR-010).

## Fase 2 — Implementación

- [x] **T008** Implementar `crearNotificacion` en `backend/src/services/notificaciones.service.js` (FR-001).
- [x] **T009** Generar notificaciones al crear/confirmar un turno para cliente y barbero.
- [x] **T010** Generar notificaciones al reprogramar un turno para cliente y barbero.
- [x] **T011** Generar notificaciones al cancelar un turno para cliente y barbero.
- [x] **T012** Implementar `GET /api/notificaciones` en `backend/src/controllers/notificaciones.controller.js` (FR-002).
- [x] **T013** Implementar `PATCH /api/notificaciones/:id/leer` con verificación de dueño (FR-003, FR-005).
- [x] **T014** Implementar `PATCH /api/notificaciones/leer-todas` (FR-004).
- [x] **T015** Implementar `NotificationBell` en `frontend/src/components/layout/NotificationBell.tsx` (FR-002).
- [x] **T016** Implementar `useNotificaciones` en `frontend/src/lib/hooks/useNotificaciones.ts`.
- [ ] **T017** Implementar `GET /api/notificaciones/preferencias` (FR-009).
- [ ] **T018** Implementar `PUT /api/notificaciones/preferencias` (FR-007, FR-009).
- [ ] **T019** Implementar el envío de email y su fallback sin romper el flujo (FR-008).
- [ ] **T020** Implementar recordatorios `horasAntes` antes del turno (FR-006).
- [ ] **T021** Implementar `POST /api/admin/notificaciones/recordatorios` o el job equivalente (FR-011).
- [ ] **T022** Implementar la idempotencia por turno y tipo de evento (FR-010).
- [ ] **T023** Implementar `NotificationCenter` en `frontend/src/components/notificaciones/NotificationCenter.tsx`. No existe.
- [ ] **T024** Implementar `NotificationItem` en `frontend/src/components/notificaciones/NotificationItem.tsx`. No existe.
- [ ] **T025** Implementar `PreferenciasNotificacionForm` en `frontend/src/components/notificaciones/PreferenciasNotificacionForm.tsx`. No existe.
- [ ] **T026** Implementar `Toast` en `frontend/src/components/ui/Toast.tsx`. No existe.

## Fase 3 — Integración

- [x] **T027** Mostrar el contador de no leídas y refrescarlo al marcar como leídas.
- [x] **T028** Conectar la campana con `GET /api/notificaciones` y las acciones de lectura.
- [ ] **T029** Mostrar la lista completa de notificaciones en un centro/dropdown.
- [ ] **T030** Verificar que un cambio de estado genere notificación para cliente y barbero (SC-001).
- [ ] **T031** Verificar que el contador coincida con las no leídas (SC-002).
- [ ] **T032** Verificar que un usuario no pueda leer ni modificar notificaciones ajenas (`403`) (SC-004).
- [ ] **T033** Verificar el envío de un recordatorio real según preferencias (SC-005).
- [ ] **T034** Verificar que un fallo de email conserve la notificación interna (SC-006).
- [ ] **T035** Verificar que no se dupliquen notificaciones para el mismo turno y evento (SC-007).

## Fase 4 — Pruebas

- [ ] **T036** Crear tests de creación de notificaciones en alta, reprogramación y cancelación.
- [ ] **T037** Crear tests de listado, filtros por `leidas` y contador.
- [ ] **T038** Crear tests de marcado individual y masivo.
- [ ] **T039** Crear tests de propiedad (`403`) y de notificación inexistente (`404`).
- [ ] **T040** Crear tests de preferencias y validación (`400`).
- [ ] **T041** Crear tests de email fallido y de conservación de la notificación interna.
- [ ] **T042** Crear tests de idempotencia y de recordatorios.
- [ ] **T043** Agregar al menos un test de caso feliz y uno de error por endpoint (SC-008).

## Fase 5 — Documentación

- [x] **T044** Documentar `spec.md` y `plan.md`.
- [x] **T045** Registrar el estado de la feature en `ESTADO.md`.
- [x] **T046** Crear este `tasks.md` como backfill.
- [ ] **T047** Corregir `Status: Implemented` de `spec.md` a `Partial`.
- [ ] **T048** Documentar que email, preferencias y recordatorios no están implementados.
- [ ] **T049** Documentar que la UI real solo incluye `NotificationBell` y `useNotificaciones`.

## Dependencias

- T008-T016 dependen de T001-T003.
- T017-T026 dependen de T004-T007.
- T027-T035 dependen de T017-T026 para las partes faltantes.
- T036-T043 dependen de T027-T035.

## Criterios de finalización

1. Todo cambio de estado genera notificación interna para cliente y barbero.
2. El contador de no leídas es correcto.
3. Marcar una o todas como leídas funciona y respeta la propiedad.
4. El usuario puede configurar email y recordatorios.
5. El recordatorio se envía según `horasAntes`.
6. Un fallo de email no pierde la notificación interna.
7. No hay duplicados por turno y tipo de evento.
8. Cada endpoint tiene al menos un test de caso feliz y uno de error.
9. La spec deja de declarar `Implemented` mientras falten FR-006 a FR-011.
