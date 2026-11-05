# Tasks — 002-catalogo-servicios

> **Feature:** Catálogo de Servicios (CU-02)
> **Fuentes:** `spec.md`, `plan.md`, `backend/src/services/servicios.service.js`, `backend/src/controllers/servicios.controller.js`, `backend/src/routes/servicios.routes.js`, `frontend/src/app/servicios/`, `frontend/src/components/servicios/`, `ESTADO.md`.
> **Convención:** `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.
> **Nota:** backfill documental posterior al desarrollo.

## Fase 1 — Preparación y configuración

- [x] **T001** Definir el modelo `Servicio` con `nombre` único, `descripcion`, `duracionMin`, `precio` y `activo` en `backend/prisma/schema.prisma`.
- [x] **T002** Definir los contratos de listado, detalle, alta, edición y desactivación en `plan.md`.
- [x] **T003** Definir las validaciones de `nombre`, `duracionMin > 0` y `precio >= 0` (FR-005).
- [x] **T004** Definir la política de borrado lógico mediante `activo` para preservar turnos históricos (FR-004, FR-008).

## Fase 2 — Implementación

- [x] **T005** Implementar `GET /api/servicios` con listado público de activos en `backend/src/controllers/servicios.controller.js` y `backend/src/services/servicios.service.js` (FR-001).
- [x] **T006** Implementar `GET /api/servicios?incluirInactivos=true` restringido a admin (FR-009).
- [x] **T007** Implementar `GET /api/servicios/:id` con `404` si no existe (FR-001).
- [x] **T008** Implementar `POST /api/servicios` restringido a admin con validación y `201` (FR-002, FR-007).
- [x] **T009** Implementar `PATCH /api/servicios/:id` restringido a admin (FR-003, FR-007).
- [x] **T010** Implementar `DELETE /api/servicios/:id` como desactivación lógica (FR-004).
- [x] **T011** Rechazar nombre duplicado con `409` en alta y edición (FR-006).
- [x] **T012** Implementar la serialización `{ id, nombre, descripcion, duracionMin, precio, activo }` en `backend/src/services/servicios.service.js`.
- [x] **T013** Implementar la página de catálogo y administración en `frontend/src/app/servicios/page.tsx`.
- [x] **T014** Implementar `ServicioCard` en `frontend/src/components/servicios/ServicioCard.tsx`.
- [x] **T015** Implementar `ServicioFormModal` en `frontend/src/components/servicios/ServicioFormModal.tsx` para alta y edición.
- [x] **T016** Implementar el estado vacío con `EmptyState` en `frontend/src/components/ui/EmptyState.tsx`.
- [ ] **T017** Implementar `ServicioForm` como componente separado (`frontend/src/components/servicios/ServicioForm.tsx`). No existe con ese nombre; el formulario está dentro del modal.
- [ ] **T018** Implementar `ConfirmDeleteDialog` en `frontend/src/components/ui/ConfirmDeleteDialog.tsx`. No existe con ese nombre; verificar si la confirmación se resuelve con `Modal`.
- [ ] **T019** Verificar que la UI aplique las mismas validaciones que la API (FR-005, SC-003).

## Fase 3 — Integración

- [x] **T020** Consumir `GET /api/servicios` desde el catálogo público (SC-001).
- [x] **T021** Refrescar el catálogo después de crear, editar o desactivar un servicio (SC-002).
- [x] **T022** Verificar que desactivar un servicio lo oculte del listado público sin borrar turnos históricos (FR-008, SC-005). La lógica existe; falta prueba específica.
- [x] **T023** Verificar que las escrituras sin rol admin devuelvan `403` (FR-007, SC-004). La restricción existe en `backend/src/routes/servicios.routes.js`.

## Fase 4 — Pruebas

- [ ] **T024** Crear tests del servicio de catálogo: listado público, detalle, alta, edición, desactivación, duplicado y permisos.
- [ ] **T025** Agregar al menos un test de caso feliz y uno de error por endpoint (SC-006).
- [ ] **T026** Ejecutar pruebas de integración HTTP de los cinco endpoints con roles admin, cliente y anónimo.
- [ ] **T027** Verificar con un test que un servicio desactivado no aparezca en el listado público y sí en el listado admin con `incluirInactivos=true`.
- [ ] **T028** Verificar que la edición de un servicio preserve los turnos existentes (FR-008).

## Fase 5 — Documentación

- [x] **T029** Documentar `spec.md` y `plan.md`.
- [x] **T030** Registrar el estado de la feature en `ESTADO.md`.
- [x] **T031** Crear este `tasks.md` como backfill.
- [ ] **T032** Documentar en `plan.md` que el formulario se implementó dentro de `ServicioFormModal` y no como `ServicioForm` separado.

## Dependencias

- T005-T012 dependen de T001-T004.
- T013-T019 dependen de T005-T012.
- T020-T023 dependen de T013-T019.
- T024-T028 dependen de T020-T023.

## Criterios de finalización

1. Los cinco endpoints existen y respetan los contratos.
2. El listado público devuelve solo servicios activos.
3. El borrado es lógico y no elimina turnos históricos.
4. Las escrituras están restringidas a admin.
5. El nombre duplicado devuelve `409`.
6. Cada endpoint tiene al menos un test de caso feliz y uno de error.
7. Las diferencias entre `plan.md` y la UI real están documentadas.
