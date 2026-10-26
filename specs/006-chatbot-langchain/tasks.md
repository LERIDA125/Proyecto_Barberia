# Tasks — 006-chatbot-langchain

> **Feature:** Asistente Conversacional (LangChain + RAG) (CU-06)
> **Fuentes:** `spec.md`, `plan.md`, `backend/src/agent/`, `backend/src/services/asistente.service.js`, `backend/src/controllers/asistente.controller.js`, `backend/src/routes/{chat,asistente}.routes.js`, `backend/data/`, `datos_barberia.md`, `frontend/src/components/chat/ChatWidget.tsx`, `frontend/src/components/layout/Navbar.tsx`, `ESTADO.md`.
> **Convención:** `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.
> **Nota:** backfill documental posterior al desarrollo. La spec dice que la UI está pendiente, pero `ChatWidget` existe y está montado en el layout; esa contradicción debe corregirse.

## Fase 1 — Preparación y configuración

- [x] **T001** Incorporar LangChain.js `0.3.x`, `@langchain/groq`, `@langchain/ollama` y `@huggingface/transformers` en `backend/package.json`.
- [x] **T002** Configurar `LLM_PROVIDER`, credenciales y modelo en `backend/src/config/env.js` y `.env.example`.
- [x] **T003** Definir la fuente de conocimiento `datos_barberia.md` y la variable `ASISTENTE_DOC`.
- [x] **T004** Implementar la ingesta con chunking 500/50 y persistencia en `backend/data/vector_db.json` mediante `backend/scripts/ingest.js` y `backend/src/agent/vectorStore.js`.
- [x] **T005** Implementar embeddings locales `Xenova/all-MiniLM-L6-v2` en `backend/src/agent/embeddings.js`.
- [x] **T006** Definir el prompt de recepcionista en español en `backend/src/agent/prompts.js` (FR-007).
- [x] **T007** Definir los contratos de `POST /api/chat`, `POST /api/asistente/mensaje`, `GET/DELETE /api/asistente/historial` y `GET /api/asistente/tools` en `plan.md`.

## Fase 2 — Implementación

- [x] **T008** Implementar el retriever RAG y la orquestación en `backend/src/services/asistente.service.js` (FR-001).
- [x] **T009** Implementar `POST /api/chat` y `POST /api/asistente/mensaje` con `requiereAuth` (FR-010).
- [x] **T010** Implementar `GET /api/asistente/historial` y `DELETE /api/asistente/historial` (FR-008).
- [x] **T011** Implementar historial por conversación en `backend/src/agent/conversations.js` con persistencia JSON en `backend/data/conversaciones/`.
- [x] **T012** Implementar la tool `consultar_disponibilidad` delegando en `barberos.service.disponibilidad` (FR-002, FR-011).
- [x] **T013** Implementar la tool `reservar_turno` delegando en `turnos.service.crear` (FR-003, FR-011).
- [x] **T014** Implementar la tool `consultar_mis_turnos` delegando en `turnos.service.listar` (FR-004, FR-011).
- [x] **T015** Implementar la tool `cancelar_turno` delegando en `turnos.service.cancelar` con verificación de propiedad (FR-004, FR-011).
- [x] **T016** Implementar la tool `listar_servicios` sobre `servicios.service` (FR-001).
- [x] **T017** Implementar el tool loop con `bindTools`, `AIMessage.tool_calls`, `ToolMessage` y máximo 5 iteraciones en `backend/src/services/asistente.service.js`.
- [x] **T018** Usar exclusivamente `req.usuario.id` para la identidad de las tools, sin aceptar `clienteId` desde el texto (FR-005, SC-004).
- [x] **T019** Traducir errores de negocio (`AppError`) a mensajes naturales (FR-006).
- [x] **T020** Implementar el fallback `MENSAJE_DISULPA` ante fallo del proveedor LLM (FR-009).
- [x] **T021** Inyectar el catálogo de barberos y servicios (UUID) en el system prompt para evitar endpoints adicionales.
- [x] **T022** Implementar `ChatWidget` en `frontend/src/components/chat/ChatWidget.tsx`.
- [x] **T023** Montar `ChatWidget` en `frontend/src/app/layout.tsx` o en `Navbar.tsx`.
- [x] **T024** Condicionar el widget a la existencia de sesión y mostrar las tools invocadas.
- [ ] **T025** Implementar `ChatMessageList` en `frontend/src/components/chat/ChatMessageList.tsx`. No existe; verificar si está embebido en `ChatWidget`.
- [ ] **T026** Implementar `ChatInput` en `frontend/src/components/chat/ChatInput.tsx`. No existe como componente separado.
- [ ] **T027** Implementar `ToolResultCard` en `frontend/src/components/chat/ToolResultCard.tsx`. No existe como componente separado.
- [ ] **T028** Implementar `TypingIndicator` en `frontend/src/components/chat/TypingIndicator.tsx`. No existe como componente separado.
- [ ] **T029** Implementar `useAsistente` en `frontend/src/lib/hooks/useAsistente.ts`. No existe.
- [ ] **T030** Implementar el límite de uso `429` previsto en `plan.md`. Verificar si existe rate limiting real.
- [ ] **T031** Verificar que el `delete` del historial limpie efectivamente la conversación en el backend y en la UI.

## Fase 3 — Integración

- [x] **T032** Conectar el widget con `POST /api/asistente/mensaje` usando cookies de sesión.
- [x] **T033** Mostrar sugerencias rápidas y estado de “escribiendo” en el widget.
- [x] **T034** Renderizar el turno creado y las tools invocadas en la respuesta.
- [ ] **T035** Verificar el flujo RAG completo con una pregunta real sobre servicios y precios (SC-001, FR-001).
- [ ] **T036** Verificar una reserva por chat de punta a punta, con confirmación explícita y sin solapes (SC-002, SC-003).
- [ ] **T037** Verificar listado y cancelación de un turno propio por chat (FR-004).
- [ ] **T038** Verificar que el asistente ignore un `clienteId` inyectado en el texto (FR-005, SC-004).
- [ ] **T039** Verificar el fallback ante un proveedor LLM caído o sin credenciales (SC-006).
- [ ] **T040** Verificar el reinicio del historial desde la UI (SC-007).

## Fase 4 — Pruebas

- [ ] **T041** Crear tests de `asistente.service` con LLM y tools mockeadas: respuesta RAG, tool loop y límite de iteraciones.
- [ ] **T042** Crear tests de cada tool: disponibilidad, reserva, listado, cancelación y servicios.
- [ ] **T043** Crear tests de identidad: la tool usa siempre `usuario.id` y no el texto.
- [ ] **T044** Crear tests de errores de negocio traducidos a lenguaje natural.
- [ ] **T045** Crear tests del fallback ante fallo del LLM.
- [ ] **T046** Crear tests de endpoints: `400` mensaje vacío, `401` sin sesión y `200` con LLM mockeado (SC-008).
- [ ] **T047** Documentar la deuda CA-06.9 como pendiente en `ESTADO.md` hasta que existan y se ejecuten estos tests.

## Fase 5 — Documentación

- [x] **T048** Documentar `spec.md` y `plan.md`.
- [x] **T049** Registrar el estado `Partial` en `ESTADO.md`.
- [x] **T050** Crear este `tasks.md` como backfill.
- [ ] **T051** Corregir la contradicción de la spec: la UI (`ChatWidget`) ya existe; el pendiente real son los tests y la verificación E2E.
- [ ] **T052** Corregir en `plan.md` la lista de componentes de chat propuestos frente a la implementación real (solo `ChatWidget.tsx`).
- [ ] **T053** Documentar que los endpoints de chat exigen autenticación incluso para RAG, aunque la fase 1 se había planteado pública.

## Dependencias

- T008-T021 dependen de T001-T007.
- T022-T031 dependen de T008-T021.
- T032-T040 dependen de T022-T031.
- T041-T047 dependen de T032-T040.

## Criterios de finalización

1. El asistente responde con información real del local y no inventa servicios.
2. Las tools reutilizan los services y usan solo la identidad de sesión.
3. Crear y cancelar exigen confirmación explícita.
4. Los errores de negocio y fallos del LLM se comunican sin romper la UI.
5. El historial se conserva y se puede reiniciar.
6. Existen tests con LLM/tools mockeados y se ejecutaron.
7. Las contradicciones entre spec, plan y UI real están corregidas.
