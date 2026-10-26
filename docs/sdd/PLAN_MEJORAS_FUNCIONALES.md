# Plan de mejoras funcionales — Proyecto Barbería

**Fecha:** 2026-10-26
**Rol:** Tech Lead
**Método:** recuperación del estado actual desde `specs/`, `ESTADO.md`, `docs/sdd/` y una inspección acotada del código del chatbot. No se repitió la auditoría documental.
**Regla de evidencia:** una funcionalidad no se declara completa porque sus archivos existan; se distingue entre implementación ausente, defecto confirmado, prueba pendiente y documentación desactualizada.

---

## 1. Estado recuperado del repositorio

- Rama de trabajo `feature/clientes`; el commit `752ec9f` incluye el ciclo 013, el backfill y los artefactos iniciales de 014. El cierre actual deja cambios posteriores sin commit.
- `specs/` contiene 15 entradas con `spec.md`, `plan.md` y `tasks.md`.
- `006-chatbot-langchain` y `007-sync-calendario-mcp` están en `Partial`: hay implementación, pero no evidencia de ejecución end-to-end.
- `008`, `009` y `010` están en `Partial`: el código cubre un subconjunto de sus planes.
- `011`, `012` y `013` están implementadas. En `013` queda pendiente el build dentro del repositorio con el servidor de desarrollo detenido.
- La suite backend tiene 14 tests, incluidos 6 de historial; siguen sin existir tests del agente, de las tools, de MCP Calendar ni del frontend.
- El incremento 014 implementa la acción de reinicio que completa la parte de UI de FR-008; lint, TypeScript y backend test suite se ejecutaron. La interacción manual en navegador real sigue pendiente.
- `datos_barberia.md` sigue contradiciendo el comportamiento real del chatbot (dice que no reserva ni cancela).

---

## 2. Funcionalidades que requieren implementación

| Funcionalidad | Requisito pendiente | Evidencia | Tipo de pendiente | Dependencias | Prioridad |
|---|---|---|---|---|---|
| Rate limit del asistente | `429` previsto en `plan.md` (T030) | No se encontró limitador en `asistente.controller.js` ni en `asistente.routes.js` | implementación pendiente | Middleware o servicio de límites; decisión de cuota | Media |
| Diagnóstico de tools del asistente | `GET /api/asistente/tools` previsto en `plan.md` | La ruta no está registrada en `asistente.routes.js` | implementación pendiente | Autorización admin; contrato de respuesta | Baja |
| Router de disponibilidad | Contratos de `008-gestion-disponibilidad` | `backend/src/routes/disponibilidad.routes.js` está montado pero no define rutas; responde 404 | implementación pendiente | Decisión: implementar o retirar el router | Media |
| Horarios y feriados | Contratos de `008` | No existen `/api/barberos/me/horarios`, `/api/admin/feriados` ni modelo `Feriado` | implementación pendiente | Modelo de datos; migración; UI de panel | Media |
| Ficha de cliente | Contratos de `009-historial-visitas` | No existen `/api/clientes/me/ficha` ni `/api/clientes/:id/ficha` con preferencias/observaciones | implementación pendiente | Modelo de datos; permisos; UI de ficha | Media |
| Preferencias y recordatorios | Contratos de `010-notificaciones-estado` | No existen preferencias, recordatorios ni proveedor de email | implementación pendiente | Modelo de datos; proveedor externo; decisión de producto | Baja |

---

## 3. Funcionalidades implementadas pero no suficientemente verificadas

| Funcionalidad | Requisito pendiente | Evidencia | Tipo de pendiente | Dependencias | Prioridad |
|---|---|---|---|---|---|
| Tools del chatbot | FR-002 a FR-006, FR-011 y SC-001 a SC-005 | `agent/tools.js` define y ejecuta las tools; no hay tests que prueben identidad, validación ni errores | prueba pendiente | Suite backend; mocks de services | Alta |
| Tool loop y fallback del agente | FR-009, SC-006 y SC-008 | `asistente.service.js` implementa hasta 5 iteraciones y `MENSAJE_DISULPA`; no hay tests con LLM mockeado | prueba pendiente | LLM mockeado; tool loop | Alta |
| RAG del asistente | FR-001 y SC-001 | Existe ingesta y recuperación; no hay evidencia de una respuesta real basada en la base de conocimiento | prueba pendiente | Vector store de prueba; proveedor LLM o mock | Alta |
| Confirmación antes de escribir | FR-003, FR-004 y SC-003 | La exigencia está en `PROMPT_AGENTE`; no hay evidencia de que el servidor impida una escritura sin confirmación | sin evidencia suficiente | Decisión de diseño; estado de confirmación | Alta |
| Sincronización con Google Calendar | Requisitos de `007-sync-calendario-mcp` | Cliente MCP, adapter y llamadas de sincronización existen; no hay prueba de ejecución real ni con mocks | prueba pendiente | Servidor MCP; credenciales; entorno aislado | Alta |
| Verificación integral del historial del chatbot | FR-008 y SC-007 | 014 cubre borrado/propiedad con tests sobre almacenamiento temporal y la UI consume el endpoint; falta verificación manual/E2E de la UI | prueba pendiente | Navegador; pruebas end-to-end | Media |
| Build e hidratación del footer | Criterios de `013-footer-anio` | Build aislado y HTTP verificados; build en repositorio e hidratación en navegador pendientes | prueba pendiente | Servidor de desarrollo detenido; navegador | Baja |

---

## 4. Pruebas pendientes priorizadas

1. **Chatbot — tools y agente:** identidad de sesión, parámetros inválidos, errores `AppError`, fallback del LLM, límite de iteraciones y forma de la respuesta.
2. **Chatbot — historial:** lectura, borrado y rechazo de acceso a conversaciones ajenas.
3. **Chatbot — confirmación:** demostrar que una reserva o cancelación no se ejecuta sin confirmación explícita, o documentar que hoy solo está garantizada por prompt.
4. **MCP Calendar:** cliente y adapter con mock; salud, timeout, error de comunicación y consistencia de `googleEventId`. Sin escrituras reales.
5. **API de disponibilidad:** decidir si el router vacío se implementa o se elimina; si se implementa, contrato y tests.
6. **Frontend:** no hay infraestructura de tests; cualquier cambio visual se valida con lint, TypeScript y verificación manual acotada.
7. **Integral:** smoke test seguro con datos de prueba, sin eventos reales de Calendar ni datos personales.

---

## 5. Inconsistencias documentales relevantes

| Inconsistencia | Evidencia | Acción |
|---|---|---|
| `datos_barberia.md` dice que el bot no reserva ni cancela | Las tools `reservar_turno` y `cancelar_turno` sí lo hacen | Decidir si se actualiza el documento fuente o se restringe el prompt; hacerlo en un ciclo SDD |
| `specs/006/plan.md` lista componentes de chat que no existen como archivos separados | La UI real está concentrada en `ChatWidget.tsx` | Corregir el plan o extraer componentes en un ciclo posterior; no es un defecto funcional |
| `tasks.md` de `006` conserva tareas de UI y tests sin evidencia | T025-T031 y T035-T047 siguen `[ ]` | Mantenerlas abiertas; no marcarlas por existencia de código |
| `ESTADO.md` dice que el chatbot tiene persistencia, pero no que el usuario pueda reiniciarla desde la UI | El backend permite borrar; el widget no ofrece la acción | Resolver en el primer incremento |
| `013` tiene el build del repositorio pendiente | El intento anterior no completó por el servidor de desarrollo activo | Documentar como limitación; no presentarlo como build verde en el repositorio |

---

## 6. Riesgos y dependencias

- **Datos reales:** cualquier prueba de reservas o Calendar debe usar datos de prueba y no debe escribir eventos reales.
- **LLM externo:** sin credenciales válidas no se puede validar el RAG real; los tests deben usar mocks y la verificación real queda como procedimiento manual.
- **Confirmación:** si se intenta imponer en el servidor, requiere definir cómo se representa una confirmación y cómo se evita el replay; no debe improvisarse dentro de un cambio de UI.
- **Migraciones:** `008` y `009` requieren cambios de modelo; no se abordan sin spec/plan aprobados y sin estrategia de migración segura.
- **Regresión:** el chatbot comparte services con la API; cualquier cambio en tools debe conservar los contratos de `003` y `004`.
- **Frontend sin tests:** el proyecto no tiene runner de tests de UI; agregar uno sería una dependencia nueva y requiere justificación aparte.

---

## 7. Orden recomendado

1. **`015-chatbot-tests-tools`** — cubrir tools, identidad, errores y fallback con mocks (CA-06.9). Es la mayor deuda de verificación del chatbot.
3. **Decisión RAG** — resolver la contradicción de `datos_barberia.md` antes de afirmar que el RAG responde correctamente.
4. **Calendar MCP con mocks** — probar cliente, timeout y errores sin escribir eventos reales.
5. **`008` disponibilidad** — decidir el router vacío y luego horarios/feriados con migración aprobada.
6. **`009` ficha de cliente** y **`010` notificaciones** — implementar solo con modelo y contratos aprobados.
7. **Cierre de `013`** — build en repositorio con el servidor detenido e hidratación en navegador.

---

## 8. Primer incremento seleccionado y ejecutado

**Feature:** `014-chat-reinicio-conversacion`.

**Resultado:** la implementación y las verificaciones automatizadas están registradas en `specs/014-chat-reinicio-conversacion/tasks.md`. Quedó pendiente probar la interacción en navegador real, por lo que el estado permanece Partial.

**Por qué se seleccionó:**

- Tiene un requisito explícito y verificable: FR-008 de `006-chatbot-langchain`.
- La ausencia es visible: el backend ya permite borrar el historial, pero el usuario no tiene forma de reiniciar la conversación desde el widget.
- El alcance es acotado: un botón/acción en `ChatWidget.tsx`, uso del endpoint existente y tests del servicio de historial.
- Se puede probar sin datos reales: almacenamiento temporal, sin LLM y sin Calendar.
- No requiere dependencias nuevas ni cambios de arquitectura.

**Fuera de alcance:** tests completos del agente, rate limit, confirmación server-side, cambios en RAG y cualquier modificación de servicios de turnos.
