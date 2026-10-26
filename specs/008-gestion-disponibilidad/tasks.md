# Tasks — 008-gestion-disponibilidad

> **Feature:** Gestión de Disponibilidad y Ausencias (CU-08)
> **Fuentes:** `spec.md`, `plan.md`, `backend/src/services/barberos.service.js`, `backend/src/routes/barberos.routes.js`, `backend/src/routes/disponibilidad.routes.js`, `backend/prisma/schema.prisma`, `frontend/src/components/panel/BloqueosManager.tsx`, `ESTADO.md`.
> **Convención:** `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.
> **Nota:** la spec declara `Status: Implemented`, pero `ESTADO.md` e `index.md` dicen `Partial`. El código confirma que **feriados globales, horarios semanales multi-bloque, `GET /api/disponibilidad` y la validación de solape de bloqueos no están implementados**. El estado correcto es `Partial`.

## Fase 1 — Preparación y configuración

- [x] **T001** Definir la disponibilidad a partir de `Barbero.horarioInicio`, `Barbero.horarioFin` y `Barbero.diasLaborales` en `backend/prisma/schema.prisma`.
- [x] **T002** Definir el modelo `Bloqueo` con `barberoId`, `inicio`, `fin` y `motivo`.
- [x] **T003** Definir los contratos de disponibilidad, horarios y bloqueos en `plan.md`.
- [x] **T004** Definir las reglas de franjas en intervalos de `Servicio.duracionMin` (FR-002).
- [x] **T005** Centralizar el cálculo en `backend/src/services/barberos.service.js`.
- [ ] **T006** Crear el modelo `HorarioLaboral` para bloques semanales múltiples. No existe en el schema; hoy el horario es un único rango por barbero.
- [ ] **T007** Crear el modelo `Feriado` para cierres globales. No existe en el schema.

## Fase 2 — Implementación

- [x] **T008** Implementar el cálculo de franjas libres combinando horario, turnos ocupados y bloqueos en `disponibilidad()`.
- [x] **T009** Generar franjas con la duración del servicio y un slot genérico de 30 minutos cuando no se envía `servicioId`.
- [x] **T010** Implementar `GET /api/barberos/:id/disponibilidad?fecha=&servicioId=` como endpoint real de consulta (FR-008).
- [x] **T011** Implementar `GET /api/barberos/me/disponibilidad` para leer la configuración del barbero (FR-003).
- [x] **T012** Implementar `PUT /api/barberos/me/disponibilidad` para actualizar horario y días (FR-003).
- [x] **T013** Validar `horarioInicio < horarioFin` y días en 0–6 (FR-004).
- [x] **T014** Implementar `GET /api/barberos/me/bloqueos` con rango `desde`/`hasta` (FR-005).
- [x] **T015** Implementar `POST /api/barberos/me/bloqueos` con `inicio`, `fin` y `motivo` (FR-005).
- [x] **T016** Implementar `DELETE /api/barberos/me/bloqueos/:id` con control de propiedad (FR-005, FR-009).
- [x] **T017** Restar los bloqueos de la disponibilidad (FR-001).
- [x] **T018** Implementar `BloqueosManager` en `frontend/src/components/panel/BloqueosManager.tsx`.
- [ ] **T019** Implementar `GET /api/disponibilidad` con `barberoId`, `servicioId` y `fecha`. El router está vacío y montado en `/api/disponibilidad`.
- [ ] **T020** Implementar `GET/PUT /api/barberos/me/horarios` con el contrato `{ dias: [{ dia, inicio, fin }] }`. Hoy se usa `/me/disponibilidad` con un único rango.
- [ ] **T021** Implementar `POST /api/admin/feriados` y el modelo `Feriado` (FR-007). No hay rutas ni referencias a feriados en el backend.
- [ ] **T022** Implementar la validación de solape entre un bloqueo y turnos confirmados, con `409` (FR-006, SC-004). `crearBloqueo` no consulta turnos antes de crear.
- [ ] **T023** Implementar `DisponibilidadPage` en `frontend/src/app/barberos/disponibilidad/page.tsx`. No existe.
- [ ] **T024** Implementar `HorarioSemanalEditor`, `BloqueoForm`, `BloqueoList` y `DisponibilidadPreview` en `frontend/src/components/barberos/`. No existen; solo `BloqueosManager`.
- [ ] **T025** Implementar `FechaRangePicker` en `frontend/src/components/ui/`. No existe.

## Fase 3 — Integración

- [x] **T026** Consumir la disponibilidad real desde el flujo de reserva de CU-03.
- [x] **T027** Consumir la configuración y los bloqueos desde el panel del barbero.
- [x] **T028** Refrescar la disponibilidad al crear o eliminar un bloqueo. La lógica de cálculo lo permite; falta prueba UI.
- [ ] **T029** Verificar que crear/eliminar un bloqueo se refleje inmediatamente en la disponibilidad pública (SC-003).
- [ ] **T030** Verificar que un horario inválido o un día fuera de rango sea rechazado desde la UI y la API (SC-005).
- [ ] **T031** Verificar que un feriado global elimine la disponibilidad de todos los barberos (SC-006). Bloqueado por T021.
- [ ] **T032** Verificar que la disponibilidad de CU-03 coincida exactamente con el motor (SC-007).
- [ ] **T033** Verificar que un barbero no pueda operar bloqueos de otro (FR-009).

## Fase 4 — Pruebas

- [ ] **T034** Crear tests del motor: horario, día no laboral, turno ocupado, bloqueo y servicio con duración variable.
- [ ] **T035** Crear tests de horarios: actualización válida, `inicio >= fin`, días fuera de rango y sin días.
- [ ] **T036** Crear tests de bloqueos: alta, listado, eliminación, propiedad y solape con turno confirmado (`409`).
- [ ] **T037** Crear tests de feriados globales cuando se implementen.
- [ ] **T038** Crear tests del endpoint público de disponibilidad cuando se implemente.
- [ ] **T039** Agregar al menos un test de caso feliz y uno de error por endpoint (SC-008).

## Fase 5 — Documentación

- [x] **T040** Documentar `spec.md` y `plan.md`.
- [x] **T041** Registrar el estado de la feature en `ESTADO.md`.
- [x] **T042** Crear este `tasks.md` como backfill.
- [ ] **T043** Corregir `Status: Implemented` de `spec.md` a `Partial`.
- [ ] **T044** Documentar que el modelo de horario real es un rango único en `Barbero`, no `HorarioLaboral` multi-bloque.
- [ ] **T045** Documentar que `GET /api/disponibilidad` no existe y que la disponibilidad real se consulta en `/api/barberos/:id/disponibilidad`.

## Dependencias

- T008-T018 dependen de T001-T005.
- T019-T025 dependen de T008-T018 y de los modelos faltantes.
- T026-T033 dependen de T019-T025 para las partes no implementadas.
- T034-T039 dependen de T026-T033.

## Criterios de finalización

1. La disponibilidad combina horario, turnos ocupados y bloqueos.
2. Los bloqueos se crean/eliminan y afectan la disponibilidad.
3. Los horarios inválidos se rechazan.
4. Los feriados globales existen y afectan a todos los barberos.
5. Un bloqueo que solapa un turno confirmado devuelve `409`.
6. Existe un endpoint público de disponibilidad coherente con el motor.
7. Cada endpoint tiene al menos un test de caso feliz y uno de error.
8. La spec deja de declarar `Implemented` mientras falten FR-006 y FR-007.
