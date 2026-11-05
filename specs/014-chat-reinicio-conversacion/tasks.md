# Tasks — 014-chat-reinicio-conversacion

> **Feature:** Reinicio de conversación del asistente
> **Fuentes:** `spec.md`, `plan.md`, `specs/006-chatbot-langchain/spec.md` (FR-008), `frontend/src/components/chat/ChatWidget.tsx`, `backend/src/routes/asistente.routes.js`, `backend/src/services/asistente.service.js`, `backend/src/agent/conversations.js`.
> **Convención:** `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.

## Fase 1 — Preparación

- [x] **T001** Crear `spec.md` con problema, alcance, requisitos y criterios de aceptación.
- [x] **T002** Crear `plan.md` con componentes, enfoque, riesgos y estrategia de pruebas.
- [x] **T003** Crear este `tasks.md` con tareas atómicas y trazabilidad.

## Fase 2 — Implementación

- [x] **T004** Agregar estado `reiniciando`, bloquear acciones concurrentes y mostrar la acción solo con sesión en `ChatWidget.tsx` (FR-014-001, FR-014-006).
- [x] **T005** Pedir confirmación explícita antes de borrar (FR-014-002).
- [x] **T006** Invocar `DELETE /api/asistente/historial` con el `sesionId` de la sesión autenticada, incluso mientras se restaura el historial (FR-014-003).
- [x] **T007** Limpiar mensajes, contador y `localStorage` solo después de confirmar el borrado del backend (FR-014-004).
- [x] **T008** Conservar el historial visible y mostrar un error genérico ante fallo o el mensaje controlado de sesión expirada ante `401` (FR-014-005).
- [x] **T009** Asegurar accesibilidad por teclado y nombre accesible del botón (FR-014-006).
- [x] **T010** No modificar contratos, dependencias, modelos, servicios de turnos, Calendar, RAG ni tools (FR-014-008).

## Fase 3 — Pruebas

- [x] **T011** Crear `backend/src/tests/asistente.historial.test.js` con directorio temporal y limpieza mediante `test.after`.
- [x] **T012** Cubrir lectura y borrado del historial propio (SC-014-001).
- [x] **T013** Cubrir `403` al leer o borrar una conversación ajena y verificar que el archivo persiste (SC-014-002, FR-014-007).
- [x] **T014** Cubrir historial inexistente o sin `sesionId`.
- [x] **T015** Ejecutar `npm test` en `backend/`: 14/14 tests aprobados.
- [x] **T016** Ejecutar `npm run lint` en `frontend/`: 0 errores y 3 advertencias preexistentes en archivos ajenos al cambio.
- [x] **T017** Ejecutar `npx tsc --noEmit` en `frontend/`: sin errores.
- [x] **T018** Registrar que la interacción no se verificó en navegador real; la limitación quedó documentada en el índice y en `docs/sdd/REGISTRO_MEJORAS_SDD.md`.

## Fase 4 — Cierre documental

- [x] **T019** Actualizar `specs/index.md` con la feature 014, estado y relación con FR-008.
- [x] **T020** Actualizar `docs/sdd/ESTADO_DOCUMENTACION_SDD.md` y `docs/sdd/PLAN_MEJORAS_FUNCIONALES.md`.
- [x] **T021** Actualizar `docs/sdd/REGISTRO_MEJORAS_SDD.md`, `ESTADO.md` y `README.md` únicamente donde la información estaba desactualizada.
- [x] **T022** Registrar evidencia de implementación y pruebas; mantener pendiente la verificación manual en navegador.

## Dependencias

- T004-T010 dependen de T001-T003.
- T011-T014 dependen de T003 y del entorno de tests.
- T015-T018 dependen de T004-T014.
- T019-T022 dependen de T015-T018.

## Criterios de finalización

1. El reinicio confirmado deja el backend sin historial para el identificador y la UI en bienvenida.
2. Un fallo no borra la vista ni se presenta como éxito.
3. El acceso a conversaciones ajenas sigue devolviendo `403`.
4. Los tests nuevos y los existentes pasan.
5. Lint termina sin errores nuevos y TypeScript termina sin errores.
6. La documentación refleja el estado real y las limitaciones de verificación.
