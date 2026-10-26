# Tasks — 012-vista-clientes

> **Feature:** Vista de Clientes (CU-12)
> **Fuentes:** `spec.md`, `plan.md`, `backend/src/services/clientes.service.js`, `backend/src/controllers/clientes.controller.js`, `backend/src/routes/clientes.routes.js`, `frontend/src/app/panel/clientes/page.tsx`, `frontend/src/components/panel/FichaCliente.tsx`, `frontend/src/lib/api/clientes.ts`, `frontend/src/lib/hooks/useClientes.ts`, `frontend/src/types/api.ts`, `ESTADO.md`.
> **Convención:** `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.
> **Nota:** backfill documental posterior al desarrollo.

## Fase 1 — Preparación y configuración

- [x] **T001** Definir el contrato `GET /api/clientes?limite=` con default 200 y tope 500 (FR-001).
- [x] **T002** Definir la validación de `limite` inválido con `400` (FR-002).
- [x] **T003** Definir el resumen `{ totalTurnos, completados, totalGastado, ultimaVisita }` en `obtenerHistorialCliente` (FR-007).
- [x] **T004** Definir la regla de que `totalGastado` sume solo turnos completados (FR-009).
- [x] **T005** Definir que el resumen se calcule sobre los turnos ya traídos, sin consultas adicionales (FR-008).
- [x] **T006** Definir los tipos `Cliente.totalTurnos` y `HistorialCliente.resumen` en `frontend/src/types/api.ts`.

## Fase 2 — Implementación

- [x] **T007** Implementar `listarClientes({ limite })` con `rol: 'cliente'`, `orderBy nombre asc` y `take` en `backend/src/services/clientes.service.js`.
- [x] **T008** Incluir `_count.turnos` y serializar `totalTurnos` (FR-010).
- [x] **T009** Implementar `resolverLimite` con default 200 y cap 500 (FR-001, FR-002).
- [x] **T010** Implementar el handler `listarClientes` en `backend/src/controllers/clientes.controller.js`.
- [x] **T011** Montar `GET /api/clientes` con `requiereAuth` + `requiereRol('barbero', 'admin')` (FR-003).
- [x] **T012** Extender `obtenerHistorialCliente` con el `resumen` (FR-007).
- [x] **T013** Calcular `totalTurnos`, `completados`, `totalGastado` y `ultimaVisita` (FR-007, FR-009).
- [x] **T014** Implementar `getClientes(limite?)` en `frontend/src/lib/api/clientes.ts`.
- [x] **T015** Implementar `useClientes` en `frontend/src/lib/hooks/useClientes.ts`.
- [x] **T016** Cargar la lista completa al montar `/panel/clientes`, sin exigir búsqueda previa (FR-001).
- [x] **T017** Implementar filtro client-side case-insensitive por nombre y email (FR-004).
- [x] **T018** Implementar orden client-side por nombre o por más turnos (FR-005).
- [x] **T019** Mostrar nombre, email y badge de `totalTurnos` por cliente (FR-010).
- [x] **T020** Distinguir “sin clientes” de “filtro sin coincidencias” con estados vacíos distintos (FR-006).
- [x] **T021** Mostrar el resumen en `FichaCliente`: total turnos, completados, total gastado y última visita (FR-007).
- [x] **T022** Mostrar total gastado en cero cuando no hay completados (FR-009).
- [x] **T023** Conservar la ficha y el historial existentes (FR-011).
- [ ] **T024** Implementar `ClientesFiltro` y `ClienteListItem` en `frontend/src/components/clientes/`. No existen; el filtro y la lista están embebidos en la página.
- [ ] **T025** Verificar que el `limite` inválido devuelva `400` y que el límite válido no sea rechazado (SC-005).

## Fase 3 — Integración

- [x] **T026** Conectar la vista con `GET /api/clientes` y `GET /api/clientes/:id/historial`.
- [x] **T027** Refrescar la lista con “Reintentar” ante error.
- [x] **T028** Mantener la búsqueda existente para la ficha sin romper su flujo.
- [ ] **T029** Verificar que la lista cargue completa sin búsqueda previa en ejecución (SC-001).
- [ ] **T030** Verificar filtro y orden en el cliente sin recargar la página (SC-002).
- [ ] **T031** Verificar el resumen con un cliente con completados y con uno sin completados (SC-003).
- [ ] **T032** Verificar que barbero/admin accedan y que un cliente reciba `403` (SC-004).
- [ ] **T033** Verificar el tope de 500 clientes y el comportamiento con `limite=500` (SC-005).

## Fase 4 — Pruebas

- [ ] **T034** Crear tests de `listarClientes`: default, límite válido, cap 500, `400` inválido y `totalTurnos`.
- [ ] **T035** Crear tests del endpoint: `200` para barbero/admin, `401` sin sesión y `403` para cliente.
- [ ] **T036** Crear tests del resumen: total, completados, gasto solo de completados y última visita.
- [ ] **T037** Crear tests de cliente sin turnos: gasto 0 y última visita `null`.
- [ ] **T038** Ejecutar `node --check` sobre archivos backend modificados y registrar el resultado (SC-006).
- [ ] **T039** Ejecutar `npx tsc --noEmit` en `frontend/` y registrar el resultado (SC-006).
- [ ] **T040** Ejecutar `npx eslint` sobre los archivos frontend modificados y registrar el resultado (SC-006).
- [ ] **T041** Crear tests de aceptación por cada criterio de la spec.

## Fase 5 — Documentación

- [x] **T042** Documentar `spec.md` y `plan.md`.
- [x] **T043** Registrar el estado de la feature en `ESTADO.md`.
- [x] **T044** Crear este `tasks.md` como backfill.
- [ ] **T045** Documentar que `components/clientes/*` no existe y que la UI está embebida en `app/panel/clientes/page.tsx`.
- [ ] **T046** Adjuntar evidencia de `node --check`, `tsc --noEmit` y `eslint` para respaldar SC-006.

## Dependencias

- T007-T013 dependen de T001-T006.
- T014-T025 dependen de T007-T013.
- T026-T033 dependen de T014-T025.
- T034-T041 dependen de T026-T033.

## Criterios de finalización

1. La lista de clientes carga completa sin búsqueda previa.
2. El filtro y el orden funcionan en el cliente sin recargar.
3. La ficha muestra total, completados, gasto y última visita.
4. El gasto es 0 cuando no hay completados.
5. Barbero/admin acceden; cliente recibe `403`.
6. El límite respeta default 200 y cap 500.
7. No se rompe la ficha ni el historial existentes.
8. Existen tests y evidencia de `node --check`, `tsc --noEmit` y `eslint`.
