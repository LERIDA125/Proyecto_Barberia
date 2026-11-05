# Tasks — 009-historial-visitas

> **Feature:** Historial de Visitas (Fichas de Cliente) (CU-09)
> **Fuentes:** `spec.md`, `plan.md`, `backend/src/services/clientes.service.js`, `backend/src/controllers/clientes.controller.js`, `backend/src/routes/clientes.routes.js`, `frontend/src/app/panel/clientes/page.tsx`, `frontend/src/components/panel/FichaCliente.tsx`, `frontend/src/components/panel/TurnoHistorialCard.tsx`, `ESTADO.md`.
> **Convención:** `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.
> **Nota:** la spec declara `Status: Implemented`, pero solo existe la vista de staff. **Faltan los endpoints del cliente, la ficha propia editable, el filtro por fechas, los contadores y la privacidad de observaciones.** El estado correcto es `Partial`.

## Fase 1 — Preparación y configuración

- [x] **T001** Definir los contratos de historial y ficha en `plan.md`.
- [x] **T002** Definir la regla de que el historial se construye solo con turnos `completado` (FR-004).
- [x] **T003** Definir el control de acceso por rol y propiedad (FR-007).
- [ ] **T004** Definir los campos de ficha del cliente (preferencias, observaciones) en el modelo. Verificar si existen en `Usuario` o si hay que crearlos.
- [ ] **T005** Definir la política de privacidad de observaciones: visibles solo para staff autorizado (FR-008).
- [ ] **T006** Definir paginación e índices por cliente y fecha (FR-010, FR-009).

## Fase 2 — Implementación

- [x] **T007** Implementar `GET /api/clientes` para listado de clientes por staff en `backend/src/controllers/clientes.controller.js` (FR-006).
- [x] **T008** Implementar `GET /api/clientes/buscar?q=` para búsqueda por staff (FR-006).
- [x] **T009** Implementar `GET /api/clientes/:id/historial` para staff (FR-006).
- [x] **T010** Construir el historial a partir de turnos `completado` en `backend/src/services/clientes.service.js` (FR-001, FR-004).
- [x] **T011** Incluir servicio y barbero en cada visita del historial.
- [x] **T012** Implementar `frontend/src/app/panel/clientes/page.tsx` para búsqueda/listado de clientes.
- [x] **T013** Implementar `FichaCliente` en `frontend/src/components/panel/FichaCliente.tsx`.
- [x] **T014** Implementar `TurnoHistorialCard` en `frontend/src/components/panel/TurnoHistorialCard.tsx`.
- [x] **T015** Implementar `EmptyState` en `frontend/src/components/ui/EmptyState.tsx`.
- [ ] **T016** Implementar `GET /api/clientes/me/historial?desde=&hasta=` para el cliente autenticado (FR-001, FR-003).
- [ ] **T017** Implementar `GET /api/clientes/me/ficha` (FR-005).
- [ ] **T018** Implementar `PATCH /api/clientes/me/ficha` para datos y observaciones propias (FR-005).
- [ ] **T019** Implementar `GET /api/clientes/:id/ficha` para staff (FR-006).
- [ ] **T020** Implementar el filtro por rango de fechas en el historial (FR-003, FR-009).
- [ ] **T021** Implementar los contadores `totalVisitas` y `ultimaVisita` (FR-002).
- [ ] **T022** Implementar la restricción `403` para que un cliente acceda a historial/ficha ajena (FR-007).
- [ ] **T023** Implementar la ocultación de `observaciones` fuera del staff autorizado (FR-008).
- [ ] **T024** Implementar `MiHistorialPage` en `frontend/src/app/mis-turnos/historial/page.tsx`. No existe.
- [ ] **T025** Implementar `HistorialTimeline`, `VisitaItem`, `ClienteFicha` y `ResumenContadores` en `frontend/src/components/clientes/`. No existen; la UI real está en `components/panel`.
- [ ] **T026** Implementar la vista `app/clientes/page.tsx` para staff. La UI real está en `app/panel/clientes/page.tsx`.
- [ ] **T027** Implementar paginación del historial (FR-010).

## Fase 3 — Integración

- [x] **T028** Conectar la búsqueda/listado de clientes del panel con la API.
- [x] **T029** Mostrar la ficha y el historial reciente del cliente en el panel.
- [ ] **T030** Verificar que el historial solo liste turnos `completado` (SC-007).
- [ ] **T031** Verificar que los contadores coincidan con los turnos completados (SC-002).
- [ ] **T032** Verificar el filtro por fecha de punta a punta (SC-003).
- [ ] **T033** Verificar que un cliente no pueda ver historial/ficha de otro (SC-005).
- [ ] **T034** Verificar que las observaciones no se expongan a otros clientes (SC-006).
- [ ] **T035** Verificar el estado vacío de un cliente sin visitas.

## Fase 4 — Pruebas

- [ ] **T036** Crear tests de `obtenerHistorialCliente`: solo completados, orden cronológico y datos de servicio/barbero.
- [ ] **T037** Crear tests de filtros por fecha y validación de rango inválido (`400`).
- [ ] **T038** Crear tests de contadores `totalVisitas` y `ultimaVisita`.
- [ ] **T039** Crear tests de búsqueda/listado de clientes por staff y de acceso denegado para cliente.
- [ ] **T040** Crear tests de ficha propia editable y de privacidad de observaciones.
- [ ] **T041** Crear tests de acceso a historial/ficha ajena (`403`).
- [ ] **T042** Agregar al menos un test de caso feliz y uno de error por endpoint (SC-008).

## Fase 5 — Documentación

- [x] **T043** Documentar `spec.md` y `plan.md`.
- [x] **T044** Registrar el estado de la feature en `ESTADO.md`.
- [x] **T045** Crear este `tasks.md` como backfill.
- [ ] **T046** Corregir `Status: Implemented` de `spec.md` a `Partial`.
- [ ] **T047** Documentar que la UI real vive en `app/panel/clientes` y `components/panel`, no en `app/clientes` y `components/clientes`.
- [ ] **T048** Documentar que los endpoints `/me/*` y `/:id/ficha` no están implementados.

## Dependencias

- T007-T015 dependen de T001-T003.
- T016-T027 dependen de T004-T006 y de la implementación base.
- T028-T035 dependen de T016-T027 para las partes faltantes.
- T036-T042 dependen de T028-T035.

## Criterios de finalización

1. El cliente ve su historial de visitas completadas con orden y filtros.
2. Los contadores coinciden con los turnos completados.
3. El cliente puede ver y actualizar su ficha.
4. El staff busca clientes y ve ficha e historial.
5. Un cliente no accede a datos ajenos.
6. Las observaciones solo son visibles para staff autorizado.
7. Cada endpoint tiene al menos un test de caso feliz y uno de error.
8. La spec deja de declarar `Implemented` mientras falten los endpoints del cliente.
