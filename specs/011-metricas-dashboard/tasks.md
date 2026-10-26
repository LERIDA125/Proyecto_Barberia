# Tasks — 011-metricas-dashboard

> **Feature:** Dashboard de Métricas de Negocio (CU-11)
> **Fuentes:** `spec.md`, `plan.md`, `backend/src/services/metricas.service.js`, `backend/src/controllers/metricas.controller.js`, `backend/src/routes/metricas.routes.js`, `frontend/src/app/panel/metricas/page.tsx`, `frontend/src/lib/api/metricas.ts`, `frontend/src/lib/hooks/useMetricas.ts`, `frontend/src/types/api.ts`, `ESTADO.md`.
> **Convención:** `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.
> **Nota:** backfill documental posterior al desarrollo.

## Fase 1 — Preparación y configuración

- [x] **T001** Definir el contrato `GET /api/metricas?desde=&hasta=` en `plan.md` (FR-001).
- [x] **T002** Definir la semántica de rango: defaults al día actual, `hasta` inclusive hasta 23:59:59.999 y `desde > hasta` inválido (FR-009, FR-010).
- [x] **T003** Definir las fórmulas de ingresos, ocupación, turnos por estado y ranking de servicios en `plan.md`.
- [x] **T004** Definir la restricción admin-only (FR-007).
- [x] **T005** Definir los tipos `Metricas`, `MetricasIngresos`, `MetricasOcupacion` y `MetricasServicio` en `frontend/src/types/api.ts`.

## Fase 2 — Implementación

- [x] **T006** Implementar `backend/src/services/metricas.service.js` con el helper local de rango.
- [x] **T007** Calcular `turnos.porEstado` y `turnos.total` por rango (FR-005).
- [x] **T008** Calcular `ingresos.monto` solo con turnos `completado` (FR-002).
- [x] **T009** Calcular `ocupacion.horasOcupadas` a partir de `fechaFin - fechaInicio` de turnos vigentes.
- [x] **T010** Calcular `ocupacion.horasDisponibles` con barberos activos, días laborales y rango inclusivo (FR-003).
- [x] **T011** Evitar la división por cero en `ocupacion.porcentaje` (SC-003).
- [x] **T012** Calcular `serviciosMasPedidos` top 5, excluyendo cancelados y ordenando por cantidad y nombre (FR-004).
- [x] **T013** Implementar `backend/src/controllers/metricas.controller.js` y `backend/src/routes/metricas.routes.js`.
- [x] **T014** Montar `/api/metricas` y exigir `requiereAuth` + `requiereRol('admin')` (FR-007).
- [x] **T015** Rechazar `desde > hasta` con `400` (FR-006).
- [x] **T016** Implementar `MetricasPanelPage` en `frontend/src/app/panel/metricas/page.tsx`.
- [x] **T017** Implementar inputs `desde`/`hasta`, botón “Actualizar” y rango por defecto mes actual → hoy.
- [x] **T018** Implementar cards de ingresos, ocupación y turnos con el estilo del panel.
- [x] **T019** Implementar el ranking de servicios con barra proporcional sin librería de charts.
- [x] **T020** Implementar estados de carga, error con reintentar y vacío (FR-008).
- [x] **T021** Agregar el enlace “Métricas” al bloque admin de `frontend/src/app/panel/page.tsx`.
- [x] **T022** Implementar `getMetricas` en `frontend/src/lib/api/metricas.ts`.
- [x] **T023** Implementar `useMetricas` en `frontend/src/lib/hooks/useMetricas.ts`.
- [ ] **T024** Implementar `MetricasRangoForm`, `MetricasCards` y `ServiciosMasPedidosList` en `frontend/src/components/metricas/`. No existen; la UI está embebida en la página.
- [ ] **T025** Implementar el gate admin y la redirección a login de forma verificable. Confirmar el mecanismo exacto en la página.

## Fase 3 — Integración

- [x] **T026** Conectar el panel con `GET /api/metricas` y recargar al cambiar el rango.
- [x] **T027** Formatear ingresos y porcentajes según el estilo del panel.
- [x] **T028** Mostrar ceros y lista vacía cuando el rango no tiene actividad (SC-004).
- [ ] **T029** Verificar con un admin real que las métricas coinciden con los turnos del período (SC-001).
- [ ] **T030** Verificar que barbero y cliente reciban `403` en la API y en la UI (SC-001).
- [ ] **T031** Verificar que un usuario sin sesión sea redirigido al login.
- [ ] **T032** Verificar la ocupación con un rango sin capacidad (0, sin división por cero) (SC-003).
- [ ] **T033** Verificar el orden y desempate del ranking de servicios (SC-005).

## Fase 4 — Pruebas

- [ ] **T034** Crear tests de `calcularMetricas`: ingresos solo completados, conteos por estado y total.
- [ ] **T035** Crear tests de ocupación: horas disponibles, horas ocupadas, porcentaje y cero capacidad.
- [ ] **T036** Crear tests de ranking: exclusión de cancelados, orden y desempate alfabético.
- [ ] **T037** Crear tests de rango: defaults, `hasta` inclusivo y `desde > hasta` (`400`).
- [ ] **T038** Crear tests del endpoint: `200` como admin, `401` sin sesión y `403` para barbero/cliente.
- [ ] **T039** Ejecutar `node --check` sobre los archivos backend modificados y registrar el resultado (SC-006).
- [ ] **T040** Ejecutar `npx tsc --noEmit` en `frontend/` y registrar el resultado (SC-006).
- [ ] **T041** Ejecutar `npx eslint` sobre los archivos frontend modificados y registrar el resultado (SC-006).
- [ ] **T042** Crear tests de aceptación por cada criterio de la spec.

## Fase 5 — Documentación

- [x] **T043** Documentar `spec.md` y `plan.md`.
- [x] **T044** Registrar el estado de la feature en `ESTADO.md`.
- [x] **T045** Crear este `tasks.md` como backfill.
- [ ] **T046** Documentar que los componentes `components/metricas/*` no existen como archivos separados.
- [ ] **T047** Adjuntar evidencia de `node --check`, `tsc --noEmit` y `eslint` para respaldar SC-006.

## Dependencias

- T006-T015 dependen de T001-T004.
- T016-T025 dependen de T005 y del backend.
- T026-T033 dependen de T016-T025.
- T034-T042 dependen de T026-T033.

## Criterios de finalización

1. El endpoint devuelve ingresos, ocupación, turnos por estado y ranking.
2. Los ingresos solo cuentan turnos completados.
3. La ocupación nunca divide por cero.
4. El rango inválido devuelve `400` y el rango vacío devuelve ceros sin errores.
5. Solo admin accede; barbero/cliente reciben `403`.
6. La UI muestra carga, error, vacío y reintentar.
7. Existen tests de cálculo, rango y permisos.
8. La evidencia de `node --check`, `tsc --noEmit` y `eslint` está adjunta.
