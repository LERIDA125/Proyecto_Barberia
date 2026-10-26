# Tasks — 013-footer-anio

> Feature: Año del pie de página sin actualización diferida.
> Fuentes: `spec.md`, `plan.md`, código y evidencia de lint del 2026-10-26.
> Convención: `[x]` = respaldado por evidencia verificable; `[ ]` = pendiente o no verificado.
> Revisión 2026-10-26: el build descartó el cálculo directo de `new Date()` en Server y Client Components. La implementación usa `useSyncExternalStore` con snapshot de servidor de respaldo.

## Fase 1 — Confirmación y documentación

- [x] **T001** Confirmar el error actual con `npm run lint` desde `frontend/` y registrar la regla, el archivo y la línea.
- [x] **T002** Crear `spec.md`, `plan.md` y `tasks.md` de `013-footer-anio` antes de modificar código.
- [x] **T003** Registrar la propuesta en `docs/sdd/PROPUESTAS_MEJORA.md`.

## Fase 2 — Implementación

- [x] **T004** Mantener `"use client"` y obtener el año con `useSyncExternalStore`: snapshot de servidor de respaldo y snapshot de cliente con el año actual.
- [x] **T005** Eliminar `useEffect` y `useState`; conservar una constante de respaldo para el snapshot del servidor.
- [x] **T006** Mantener el texto, las clases y los enlaces existentes sin cambios visibles.
- [x] **T007** Revisar el diff para confirmar que no se modificó ningún otro archivo de producción.

## Fase 3 — Validación

- [x] **T008** Ejecutar `npm run lint` desde `frontend/`; finalizó con código 0, 0 errores y 3 advertencias preexistentes.
- [x] **T009** Ejecutar `npx tsc --noEmit` desde `frontend/`; no reportó errores.
- [x] **T010** Validar el build de producción con Turbopack en una copia aislada porque el intento en el repositorio no completó mientras `next dev` usaba el mismo `.next`; finalizó con 13/13 páginas. Limitación registrada.
- [x] **T011** Verificar por HTTP que el pie conserva el año, el aviso de derechos reservados y los enlaces a `/servicios`, `/reservar` y `/mis-turnos`; estado 200.

## Fase 4 — Cierre documental

- [x] **T012** Actualizar `docs/sdd/REGISTRO_MEJORAS_SDD.md` con especificación, archivos, tareas, pruebas y limitaciones.
- [x] **T013** Actualizar `specs/index.md`, `docs/sdd/ESTADO_DOCUMENTACION_SDD.md`, `ESTADO.md` y `README.md` con el resultado real.
- [x] **T014** Marcar en este archivo solo las tareas con evidencia ejecutada.

## Dependencias

- T004 depende de T001-T003.
- T005 y T006 dependen de T004 y pueden ejecutarse en conjunto.
- T007 depende de T004-T006.
- T008-T011 dependen de T007.
- T012-T014 dependen de T008-T011.

## Criterios de finalización

- El único archivo de producción modificado es `frontend/src/components/layout/Footer.tsx`.
- `npm run lint` termina con código 0 y sin el error del pie.
- `npx tsc --noEmit` termina sin errores.
- El build de producción con Turbopack termina correctamente en una copia aislada; el build dentro del repositorio no completó con `next dev` activo y la limitación está registrada.
- El año actual y los tres enlaces siguen presentes en el pie.
- La documentación SDD refleja resultados y limitaciones reales.
- No se crean commits ni se hace push.
