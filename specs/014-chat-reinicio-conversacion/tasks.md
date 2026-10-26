# Tasks — 014-chat-reinicio-conversacion

> **Feature:** Reinicio de conversación del asistente
> **Fuentes:** `spec.md`, `plan.md`, `specs/006-chatbot-langchain/spec.md` (FR-008), `frontend/src/components/chat/ChatWidget.tsx`, `backend/src/routes/asistente.routes.js`, `backend/src/services/asistente.service.js`, `backend/src/agent/conversations.js`.
> **Convención:** `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.

## Fase 1 — Preparación

- [x] **T001** Crear `spec.md` con problema, alcance, requisitos y criterios de aceptación.
- [x] **T002** Crear `plan.md` con componentes, enfoque, riesgos y estrategia de pruebas.
- [x] **T003** Crear este `tasks.md` con tareas atómicas y trazabilidad.

## Fase 2 — Implementación

- [ ] **T004** Agregar estado `reiniciando` y la acción de reinicio en `ChatWidget.tsx` (FR-014-001, FR-014-006).
- [ ] **T005** Pedir confirmación explícita antes de borrar (FR-014-002).
- [ ] **T006** Invocar `DELETE /api/asistente/historial` con el `sesionId` de la conversación actual (FR-014-003).
- [ ] **T007** Limpiar mensajes, contador y `localStorage` al completar (FR-014-004).
- [ ] **T008** Conservar los mensajes y mostrar error controlado ante fallo o `401` (FR-014-005).
- [ ] **T009** Asegurar accesibilidad por teclado y nombre accesible del botón (FR-014-006).
- [ ] **T010** Evitar cambios de contrato, dependencias, modelos o servicios (FR-014-008).

## Fase 3 — Pruebas

- [ ] **T011** Crear `backend/src/tests/asistente.historial.test.js` con directorio temporal (SC-014-005).
- [ ] **T012** Cubrir lectura y borrado del historial propio (SC-014-001).
- [ ] **T013** Cubrir `403` al leer o borrar una conversación ajena (SC-014-002, FR-014-007).
- [ ] **T014** Cubrir historial inexistente o sin `sesionId`.
- [ ] **T015** Ejecutar `npm test` en `backend/` y registrar el resultado real.
- [ ] **T016** Ejecutar `npm run lint` en `frontend/` y registrar el resultado real.
- [ ] **T017** Ejecutar `npx tsc --noEmit` en `frontend/` y registrar el resultado real.
- [ ] **T018** Verificar manualmente la acción de reinicio o documentar la limitación si no es posible.

## Fase 4 — Cierre documental

- [ ] **T019** Actualizar `specs/index.md` con la feature 014 y su estado.
- [ ] **T020** Actualizar `docs/sdd/ESTADO_DOCUMENTACION_SDD.md` y `docs/sdd/PLAN_MEJORAS_FUNCIONALES.md`.
- [ ] **T021** Actualizar `docs/sdd/REGISTRO_MEJORAS_SDD.md`, `ESTADO.md` y `README.md` solo en lo que cambió.
- [ ] **T022** Marcar este `tasks.md` con evidencia y pendientes reales.

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
5. Lint y TypeScript no agregan errores.
6. La documentación refleja el estado real y las limitaciones de verificación.
