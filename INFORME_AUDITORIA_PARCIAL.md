# Informe de auditoría parcial — Proyecto Barbería

**Fecha:** 2026-10-26
**Alcance:** auditoría estática del repositorio + evidencia runtime ya recolectada en sesiones previas. **No se ejecutaron pruebas nuevas, no se modificó código funcional, no se crearon ni alteraron datos y no se reiniciaron servicios.**
**Estado del informe:** `PARCIAL` — cierre anticipado a pedido, para dejar evidencia persistente antes de continuar.

> **Nota de actualización (26-oct-2026, posterior a este informe):** el backfill de los 13 `tasks.md` y la mejora `013-footer-anio` se completaron después de esta auditoría. Las afirmaciones de este documento sobre “cero `tasks.md`” y el error de lint del pie describen el estado previo. Para el estado vigente, ver `ESTADO.md`, `docs/sdd/REGISTRO_MEJORAS_SDD.md` y `specs/index.md`.

**Etiquetas usadas:**

- `VERIFICADO`: comprobado directamente por lectura de archivos, Git o ejecución previa registrada.
- `PARCIAL`: hay implementación o evidencia parcial, pero falta la verificación completa.
- `PENDIENTE`: no se comprobó todavía; requiere una acción concreta.
- `NO VERIFICADO`: no existe evidencia suficiente; no se afirma nada.

**Fuentes de evidencia utilizadas:**

- Repositorio en `C:\Users\Ferar\OneDrive\Desktop\Proyecto_Barberia`.
- `README.md`, `ESTADO.md`, `AGENTS.md`, `.instructions.md`, `.specify/memory/constitution.md`, `opencode.json`.
- `specs/` (13 features), `backend/`, `frontend/`, `.opencode/`.
- Historial Git (`git log`, `git log --diff-filter=A`).
- Logs en `C:\Users\Ferar\AppData\Local\Temp\opencode\`.
- Resultados de comandos ya ejecutados en esta auditoría (`npm test`, `npm run lint`, health checks, consulta a PostgreSQL/MCP).
- `C:\Users\Ferar\AppData\Local\Temp\opencode\audit\smoke.js` fue creado, pero **no se ejecutó**.
- `C:\Users\Ferar\AppData\Local\Temp\opencode\audit\smoke-results.json` **no existe**. No hay resultados de smoke test que reportar.

---

## 1. Estado general del proyecto

`PARCIAL`

El proyecto tiene una implementación amplia y una documentación abundante. A nivel estático se observan backend, frontend, base de datos, chatbot, RAG, tools de LangChain y servidores MCP. A nivel runtime hay evidencia de que el backend arranca, la base está levantada y sembrada, los tests unitarios pasan y el servidor MCP de Google Calendar responde con credenciales cargadas.

Sin embargo, **no hay evidencia completa de que los casos de uso funcionen end-to-end**. La prueba funcional integrada (`smoke.js`) quedó sin ejecutar, por lo que la funcionalidad de negocio solo puede clasificarse como `PARCIAL`: existe código y contratos, pero falta la ejecución verificable de cada flujo.

| Dimensión | Estado | Evidencia |
|---|---|---|
| Repositorio y estructura | `VERIFICADO` | Backend, frontend, specs, MCP y configuración de agentes presentes. |
| Backend operativo | `VERIFICADO` | `GET /api/health` respondió `200` con `{"status":"ok","servicio":"barberia-api"}` en `:3000`. |
| Frontend operativo | `PENDIENTE` | En una comprobación previa `:3001` no respondía. No se reintentó por la restricción de no reiniciar servicios. |
| Base de datos | `VERIFICADO` | Contenedor `barberia-postgres` levantado y datos sembrados (usuarios, servicios, barberos, turnos) según volcado previo. |
| Tests backend | `PARCIAL` | `npm test` pasó `8/8`, pero cubre solo auth y turnos; no cubre controllers, agente, MCP ni frontend. |
| Lint frontend | `FALLIDO` | `npm run lint` terminó con error (`react-hooks/set-state-in-effect`). Ver sección 8. |
| Spec-Driven Development | `PARCIAL` | Hay 13 specs y 13 planes, pero **cero `tasks.md`** y evidencia cronológica de documentación retroactiva. |
| MCP | `PARCIAL` | Dos servidores declarados; el de Calendar responde. No hay un MCP de terceros declarado en el proyecto. |
| Chatbot LangChain | `PARCIAL` | Dependencias, tools, prompt y widget presentes; no hay llamada real verificada al LLM. |
| Documentación para la consigna | `PARCIAL` | README extenso, pero faltan datos de integrantes y evidencia real de prompts/iteraciones. |

**Conclusión ejecutiva:** el proyecto está **avanzado en implementación**, pero la auditoría **no puede afirmar** que los 10 casos de uso estén funcionalmente verificados. El riesgo principal para la evaluación no es la falta de código, sino la **falta de evidencia reproducible** y las **contradicciones documentales**.

---

## 2. Arquitectura y tecnologías detectadas

`VERIFICADO` (por lectura de `package.json`, estructura y configuración)

| Capa | Tecnología detectada | Evidencia |
|---|---|---|
| Frontend | Next.js `16.4.0` (App Router), React `19.3.0`, Tailwind CSS `4`, TypeScript `5` | `frontend/package.json` |
| Backend | Node.js, Express `5.3.0` | `backend/package.json`, `backend/src/app.js` |
| Base de datos | PostgreSQL + Prisma `7.10` con `@prisma/adapter-pg` | `backend/package.json`, `backend/prisma/` |
| Autenticación | WebAuthn / Passkeys con `@simplewebauthn/server` v14 + cookie de sesión HMAC-SHA256 | `backend/src/services/auth.service.js`, `backend/src/utils/session.js` |
| Validación | Zod `3.25` + validadores imperativos propios | `backend/src/utils/validation.js`, `backend/src/utils/validators.js` |
| Chatbot | LangChain `0.3.x`, `@langchain/core`, `@langchain/groq`, `@langchain/ollama`, `@langchain/community`, `@huggingface/transformers` | `backend/package.json`, `backend/src/agent/` |
| MCP | `@modelcontextprotocol/sdk` + cliente HTTP/SSE propio | `backend/package.json`, `backend/src/mcp/client.js` |
| Puertos | Backend `3000`, Frontend `3001`, MCP Google Calendar `8000` | `README.md`, `opencode.json`, scripts npm |

**Arquitectura observada:**

- `backend/src/routes/` define 12 módulos de rutas montados bajo `/api`.
- `backend/src/controllers/` valida y delega; `backend/src/services/` concentra la lógica de negocio.
- `backend/src/mcp/` encapsula PostgreSQL local y Google Calendar.
- `frontend/src/app/` contiene las vistas; `frontend/src/components/` los componentes reutilizables.
- El chatbot vive en `backend/src/agent/` y `backend/src/services/asistente.service.js`; la UI está en `frontend/src/components/chat/ChatWidget.tsx`, montado en `frontend/src/app/layout.tsx`.

**Observación de arquitectura:**

- `backend/src/routes/disponibilidad.routes.js` está **vacío** y se monta en `/api/disponibilidad`. La ruta existe pero no expone ningún endpoint. `VERIFICADO` por lectura del archivo. Esto contradice la expectativa de un módulo de disponibilidad dedicado y explica un posible `404`.

---

## 3. Spec-Driven Development: evidencia en archivos y Git

`PARCIAL`

### 3.1 Documentación existente

`VERIFICADO`

- `specs/` contiene **13 features**: `000-arquitectura` y `001` a `012`.
- Cada feature tiene `spec.md` y `plan.md`: **13 `spec.md` y 13 `plan.md`**.
- **No existe ningún `tasks.md`** en `specs/` (conteo: `0`).
- `specs/index.md` y `ESTADO.md` reconocen explícitamente la deuda de `tasks.md`.
- `.specify/memory/constitution.md` define 4 gates: Requerimientos → Specs → Código → Testing.
- `AGENTS.md`, `.instructions.md` y `opencode.json` declaran la metodología Spec Kit.

### 3.2 Evidencia Git: documentación retrospectiva

`VERIFICADO`

- Todos los `spec.md` fueron agregados en un único commit: `ba699d4` (`2026-10-20`), con mensaje `chore(spec-kit): migra metodologia SDD a GitHub Spec Kit`.
- Los primeros commits de código son anteriores: `f7cc27b` (`2026-10-09`, `feat: MVP transaccional funcional para reservas (bypass local)`) y `f746275` / `33ca2ec` (`2026-10-10`, chatbot y MVP "100% funcional").
- Es decir: **el código existió antes que las specs**. La documentación SDD se incorporó después, en bloque.

`ESTADO.md` lo confirma al declarar: *"las features 001-012 se implementaron sin ejecutar `/speckit.tasks`"* y al hablar de una migración metodológica.

**Veredicto:**

- Existencia de artefactos SDD: `VERIFICADO`.
- Uso comprobado de SDD **durante** el desarrollo (spec antes que código): **NO VERIFICADO**. La evidencia cronológica apunta a **documentación retrospectiva**, no a spec-first.
- El README afirma que "la especificación se escribe y aprueba antes de codificar", pero Git no lo respalda para las features 001-012. `PARCIAL` / contradicción documental.

### 3.3 Contradicciones de estado

`VERIFICADO` (por lectura de archivos)

| Fuente | Qué declara | Problema |
|---|---|---|
| `README.md` | "todos los CU funcionales" | Contradice `ESTADO.md`, que marca 006-010 como parciales. |
| `ESTADO.md` | 006-010 `Parcial` | Coherente con la deuda técnica, pero no con el README. |
| `specs/008`, `009`, `010` | `Status: Implemented` | Contradice `ESTADO.md` y `specs/index.md`, que las marcan `Partial`. |
| `specs/006` | Supuesto de que el ChatWidget está pendiente | El widget existe y está montado en `layout.tsx`. Supuesto desactualizado. |
| `specs/007` | Supuesto de que la sincronización está en borrador | El servicio y el servidor MCP están implementados. Supuesto desactualizado. |

Estas inconsistencias no son solo cosméticas: afectan la trazabilidad que exige la constitución del proyecto.

---

## 4. Agentes, skills y comandos de OpenCode

`VERIFICADO` (por lectura de `.opencode/` y `opencode.json`)

| Componente | Contenido detectado | Estado |
|---|---|---|
| Agentes | `arquitecto.md`, `backend.md`, `frontend.md` | `VERIFICADO` |
| Skills del proyecto | `barberia-domain`, `proyecto-convenciones`, `sdd-workflow` | `VERIFICADO` |
| Comandos Spec Kit | 10 archivos `speckit.*` (analyze, checklist, clarify, constitution, converge, implement, plan, specify, tasks, taskstoissues) | `VERIFICADO` |
| Instrucciones | `AGENTS.md`, `.instructions.md`, `.specify/memory/constitution.md` | `VERIFICADO` |
| Roles | Tech Lead / Arquitecto, Backend, Frontend | `VERIFICADO` |

**Observación:** la configuración de agentes y comandos es sólida y coherente con la metodología declarada. `PARCIAL` en cuanto a **evidencia de uso real**: no hay transcripciones, logs de sesiones de OpenCode ni historial de comandos que demuestren que se ejecutaron `/speckit.specify`, `/speckit.plan`, `/speckit.tasks` o `/speckit.implement` durante el desarrollo. Los propios `ESTADO.md` e `index.md` admiten que no se ejecutó `/speckit.tasks`.

---

## 5. Servidores MCP y uso comprobado

`PARCIAL`

### 5.1 Configuración declarada

`VERIFICADO` por `opencode.json`:

| Servidor | Tipo | Configuración | Autoría |
|---|---|---|---|
| `postgres-local` | Local / stdio | `node src/mcp/postgres/server.js`, `cwd: backend` | Desarrollado por el equipo |
| `google-calendar` | Remoto / HTTP | `http://localhost:8000/mcp`, timeout `10000` | Desarrollado por el equipo (paquete autónomo en `backend/src/mcp/google-calendar/`) |

### 5.2 Uso comprobado

`VERIFICADO`

- El servidor MCP de Google Calendar estaba corriendo en `:8000`.
- `GET /health` respondió con:
  - `ok: true`
  - `serverInfo.name: "google-calendar-mcp"`
  - `version: "1.0.0"`
  - `calendarId: "primary"`
  - `timezone: "America/Argentina/Buenos_Aires"`
  - `credencialesCargadas: true`
  - `credencialesError: null`
- El backend tiene un cliente MCP propio (`backend/src/mcp/client.js`) y un servicio de integración (`backend/src/services/integraciones.service.js`).
- En el volcado previo de la base se observaron turnos con `googleEventId` no nulo, lo que sugiere que la sincronización de alta se ejecutó en algún momento. `PARCIAL`: no se verificó la creación/actualización/eliminación de un evento en vivo durante esta auditoría.

### 5.3 Requisito de "MCP externo"

`PARCIAL`

- El servidor `google-calendar` usa transporte remoto (HTTP), pero **es un servidor propio del equipo**, no un MCP de terceros.
- En la configuración **del proyecto** no hay ningún MCP externo de terceros declarado.
- Existe `context7` (`https://mcp.context7.com/mcp`) configurado en `~/.config/opencode/opencode.jsonc` (configuración global del usuario), disponible en la sesión, pero **no forma parte del repositorio ni de `opencode.json` del proyecto**.
- Conclusión: si la consigna exige "al menos un servidor MCP externo" en el sentido de terceros, **no está cumplido de forma demostrable dentro del proyecto**. Si "externo" significa transporte remoto, el servidor de Calendar califica, pero sigue siendo de autoría propia.

### 5.4 MCP PostgreSQL

`PARCIAL`

- El servidor `postgres-local` existe y está declarado como solo lectura.
- En una comprobación previa, `postgres-local_list_tables` falló porque la base estaba caída. **No se reintentó** después de levantar PostgreSQL.
- Por lo tanto, la herramienta MCP de PostgreSQL no tiene una verificación runtime reciente en este informe.

---

## 6. Chatbot y uso de LangChain

`PARCIAL`

### 6.1 Implementación detectada

`VERIFICADO` (por lectura de archivos y dependencias)

- Dependencias LangChain instaladas: `langchain`, `@langchain/core`, `@langchain/groq`, `@langchain/ollama`, `@langchain/community`, `@langchain/textsplitters`.
- Archivos del agente: `backend/src/agent/tools.js`, `prompts.js`, `llm.js`, `embeddings.js`, `vectorStore.js`, `conversations.js`.
- Orquestación: `backend/src/services/asistente.service.js`.
- Tools declaradas: 4 (`consultar_disponibilidad`, `reservar_turno`, `consultar_mis_turnos`, `cancelar_turno`).
- Tool loop con máximo de 5 iteraciones (`MAX_ITERACIONES_TOOL = 5`).
- RAG: `backend/data/vector_db.json` existe (aprox. 56.887 bytes).
- UI: `frontend/src/components/chat/ChatWidget.tsx`, montado en `frontend/src/app/layout.tsx`.
- Endpoints: `POST /api/asistente/mensaje`, `GET/DELETE /api/asistente/historial`, `POST /api/chat`.

### 6.2 Uso real

`NO VERIFICADO` / `PENDIENTE`

- No se ejecutó una llamada real a `/api/chat` ni a `/api/asistente/mensaje`.
- No se verificó que el proveedor LLM (Groq u Ollama) responda con la configuración actual.
- No se verificó que el RAG recupere documentos correctamente ni que las tools se ejecuten en una conversación real.
- No hay tests del agente ni del servicio del asistente.
- El commit `f746275` ("ChatBotFuncionando") y el `README` son evidencia de intención/estado pasado, **no una verificación reproducible**.

### 6.3 Riesgo documental

`VERIFICADO`

- `datos_barberia.md` (fuente del RAG) afirma que el asistente "NO puede crear ni cancelar turnos", pero las tools `reservar_turno` y `cancelar_turno` sí lo hacen. `ESTADO.md` ya registra esta contradicción como deuda técnica.
- El `README` menciona un "template del RAG en Python (`PROMPT_TEMPLATE`)", pero el agente observable está en JavaScript. `PENDIENTE` de confirmar si es un residuo documental o un archivo no detectado.

---

## 7. Casos de uso: verificados, parciales, pendientes y fallidos

### 7.1 Resultado global

**Ningún caso de uso de negocio tiene verificación end-to-end completa en este informe.** Lo que está verificado es la infraestructura y la existencia de implementación. La clasificación por CU es la siguiente:

| CU | Caso de uso | Implementación | Verificación funcional | Estado |
|---|---|---|---|---|
| CU-01 | Autenticación con Passkeys | Servicio, controller, rutas y frontend presentes | Tests unitarios `8/8` incluyen auth; flujo WebAuthn real no automatizado | `PARCIAL` |
| CU-02 | Catálogo de servicios | CRUD + borrado lógico + vistas | Sin E2E ejecutado | `PARCIAL` |
| CU-03 | Reserva de turnos | Servicio con validación de solapes, bloqueos y jornada | Sin E2E ejecutado | `PARCIAL` |
| CU-04 | Gestión de turnos del cliente | Cancelar/reprogramar/listar | Sin E2E ejecutado | `PARCIAL` |
| CU-05 | Panel de barberos | Agenda, estados, métricas, notas | Sin E2E ejecutado | `PARCIAL` |
| CU-06 | Chatbot LangChain | Agente, tools, RAG y widget | Sin llamada real al LLM | `PARCIAL` |
| CU-07 | Sincronización con Google Calendar (MCP) | Cliente MCP, servicio y servidor MCP | Servidor sano y credenciales cargadas; escritura en vivo no verificada | `PARCIAL` |
| CU-08 | Gestión de disponibilidad / bloqueos | Modelo `Bloqueo`, CRUD y descuento en disponibilidad | Sin E2E ejecutado | `PARCIAL` |
| CU-09 | Historial de visitas | Endpoints de clientes e historial + vista | Sin E2E ejecutado | `PARCIAL` |
| CU-10 | Notificaciones de estado | Modelo, endpoints y disparo en transiciones | Sin E2E ejecutado | `PARCIAL` |
| CU-11 | Métricas / dashboard | Endpoints y vista | Sin E2E ejecutado | `PARCIAL` |
| CU-12 | Vista de clientes | Endpoints y vista | Sin E2E ejecutado | `PARCIAL` |

### 7.2 Parcialmente verificados con evidencia más fuerte

- **CU-01:** los tests de `verificarLogin` pasan (4 casos) y el bug de `ReferenceError`/TDZ está documentado como corregido en `ESTADO.md`. `PARCIAL`: no se probó registro/login con un autenticador WebAuthn real.
- **CU-07:** el servidor MCP responde y las credenciales están cargadas; hay turnos con `googleEventId` en la base. `PARCIAL`: no se verificó alta/baja/modificación de evento en vivo en esta auditoría.

### 7.3 Pendiente de verificación

- Flujo completo de reserva (servicio → barbero → franja → confirmación).
- Cancelación y reprogramación con sus reglas de negocio.
- Agenda del barbero, transiciones de estado y edición de notas.
- Bloqueos y su efecto real sobre la disponibilidad.
- Historial de cliente y notificaciones.
- Métricas y vista de clientes.
- Chatbot con LLM real y ejecución de tools.
- Sincronización real de Google Calendar (alta, baja, modificación).
- Frontend end-to-end (`:3001`).

### 7.4 Fallidos / inconsistencias comprobadas

| Ítem | Estado | Evidencia |
|---|---|---|
| Lint del frontend | `FALLIDO` | `npm run lint` con error en `frontend/src/components/layout/Footer.tsx:18` (`react-hooks/set-state-in-effect`) + 3 warnings. |
| `/api/disponibilidad` | `FALLIDO` / `PARCIAL` | Router vacío montado en `backend/src/routes/disponibilidad.routes.js`; responde 404. |
| Estado declarado en README | `FALLIDO` | "Todos los CU funcionales" contradice `ESTADO.md` (006-010 parciales). |
| Estado de specs 008/009/010 | `FALLIDO` | `spec.md` dice `Implemented`; `ESTADO.md` e `index.md` dicen `Partial`. |
| Supuestos de specs 006/007 | `FALLIDO` | Supuestos desactualizados respecto del código actual. |

---

## 8. Pruebas y errores encontrados

### 8.1 Ejecutadas y con resultado

| Prueba | Resultado | Estado |
|---|---|---|
| `backend: npm test` | `8/8` tests en verde | `VERIFICADO` (ejecución previa) |
| `frontend: npm run lint` | 1 error + 3 warnings; exit code de error | `VERIFICADO` (ejecución previa) |
| `GET http://localhost:3000/api/health` | `200` `{"status":"ok","servicio":"barberia-api"}` | `VERIFICADO` |
| `GET http://localhost:8000/health` (MCP Calendar) | `200`, credenciales cargadas | `VERIFICADO` |
| PostgreSQL / contenedor | `barberia-postgres` levantado; datos sembrados | `VERIFICADO` (según volcado previo) |
| `smoke.js` | **No ejecutado** | `PENDIENTE` |
| `smoke-results.json` | **No existe** | `NO VERIFICADO` |

### 8.2 Detalle del lint

`VERIFICADO`

- Error: `frontend/src/components/layout/Footer.tsx:18` — `react-hooks/set-state-in-effect`.
- Warnings:
  - `frontend/src/app/mis-turnos/page.tsx`: imports `Card` y `EmptyState` sin uso.
  - `frontend/src/components/turnos/TurnoCard.tsx`: `formatearHora` sin uso.

Esto incumple el GATE 3 de la constitución ("sin errores de lint").

### 8.3 Cobertura de tests

`PARCIAL`

- Solo existen tests en `backend/src/tests/auth.test.js` y `backend/src/tests/turnos.test.js`.
- No hay tests de controllers, middlewares, servicios de servicios/barberos/clientes/notificaciones/integraciones, agente LangChain, MCP ni frontend.
- La constitución exige "al menos el caso feliz y un caso de error por endpoint"; la cobertura actual está muy por debajo.

### 8.4 Logs

`VERIFICADO` (lectura de logs)

- `barberia-backend.out.log`: solo `Servidor de barberia escuchando en el puerto 3000`.
- `barberia-backend.err.log`: solo mensajes de `dotenv` (`injected env`), sin errores.
- `backend-3100.out.log`: `Servidor de barberia escuchando en el puerto 3100`.
- `backend-3100.err.log`: solo mensajes de `dotenv`.

### 8.5 Artefactos de auditoría

`VERIFICADO`

- `C:\Users\Ferar\AppData\Local\Temp\opencode\audit\smoke.js` — creado, 19.021 bytes, **no ejecutado**.
- `C:\Users\Ferar\AppData\Local\Temp\opencode\audit\runner-3100.js` — creado para levantar una instancia aislada en `:3100`.
- `C:\Users\Ferar\AppData\Local\Temp\opencode\audit\dump.js` — usado previamente para volcar datos.
- `smoke-results.json` — **no existe**.
- Instancia aislada en `:3100` iniciada (PID 20500 al momento de crear el runner), **sin pruebas ejecutadas**. Queda pendiente detenerla si se desea limpiar el entorno.

---

## 9. Documentación existente y faltante respecto de la consigna

`PARCIAL`

### 9.1 Existente

`VERIFICADO`

- `README.md`: arquitectura, stack, tabla de CU-01 a CU-10, sección de AI Engineering, MCP, instalación, variables de entorno, estructura, tooling de OpenCode, modelo de datos y seguridad.
- `ESTADO.md`: auditoría de estado por spec, correcciones aplicadas, deuda técnica e infraestructura.
- `specs/index.md`: índice de 13 features y nota sobre estados parciales.
- 13 `spec.md` + 13 `plan.md`.
- `.specify/memory/constitution.md`: principios, gates, restricciones y roles.
- `AGENTS.md` y `.instructions.md`: roles y reglas de trabajo.
- `.opencode/agents/`, `.opencode/skills/`, `.opencode/commands/`.
- `opencode.json`: MCPs declarados.
- `datos_barberia.md`: documento de negocio usado por el RAG.

### 9.2 Faltante o insuficiente

| Requisito esperado | Estado | Detalle |
|---|---|---|
| Documento de definición del TP (tema, 10 CU, stack, integrantes) | `PENDIENTE` / faltante | No existe `docs/` ni un documento único con la consigna desarrollada. No se encontraron datos de integrantes (nombre, email, usuario de GitHub). |
| `tasks.md` por feature | `VERIFICADO` que falta | 0 archivos. `ESTADO.md` lo admite como deuda. |
| Evidencia de prompts reales usados | `PARCIAL` | El README apunta a `prompts.js` y `asistente.service.js`, pero no muestra los prompts concretos ni transcripciones. |
| Evidencia de loops de autocorrección | `PARCIAL` | Se describe el tool loop (máx. 5) y la regla de "si falla un gate, volver", pero no hay logs/iteraciones reales documentadas. |
| Evidencia de uso de Spec Kit durante el desarrollo | `NO VERIFICADO` | La cronología Git indica retrofit. No hay `tasks.md` ni historial de comandos. |
| Pruebas end-to-end / capturas / demo | `PENDIENTE` | No hay resultados de smoke test ni evidencia visual en el repo. |
| Cobertura de tests acorde a la constitución | `PARCIAL` | 8 tests; sin cobertura por endpoint. |
| MCP externo de terceros | `PARCIAL` / faltante | Los MCP del proyecto son propios; `context7` está solo en configuración global. |
| Documento PDF / entrega para el campus | `PENDIENTE` | No se encontró en el repositorio. |

### 9.3 Contradicciones documentales a corregir

`VERIFICADO`

1. README: "todos los CU funcionales" vs. `ESTADO.md`: 006-010 parciales.
2. `specs/008/009/010/spec.md`: `Status: Implemented` vs. `ESTADO.md` e `index.md`: `Partial`.
3. `specs/006/007`: supuestos desactualizados sobre el estado del chatbot y la sync.
4. `datos_barberia.md`: dice que el bot no reserva/cancela; las tools sí lo hacen.
5. README: menciona "en curso" como estado de turno, pero la lista `ESTADOS` del servicio no incluye `en_curso`.
6. README: menciona un template RAG en Python; el agente observable es JavaScript.

---

## 10. Próximos pasos priorizados

### Prioridad 1 — Cerrar evidencia funcional (sin tocar código)

1. Ejecutar el smoke test ya preparado contra una instancia aislada, sin MCP de Calendar, para evitar efectos externos:
   - `C:\Users\Ferar\AppData\Local\Temp\opencode\audit\smoke.js`
   - Guardar `smoke-results.json`.
2. Verificar los flujos de mayor peso para la evaluación: CU-01, CU-03, CU-04, CU-05, CU-06, CU-07 y CU-08.
3. Probar el chatbot con una llamada real y registrar la respuesta y las tools ejecutadas.
4. Verificar el frontend en `:3001` (levantarlo y recorrer reserva, mis turnos, panel y chat).

### Prioridad 2 — Corregir fallos que bloquean gates

1. Corregir el error de lint en `Footer.tsx` (mover el `setState` fuera del efecto o usar una alternativa).
2. Limpiar los warnings de imports/variables sin uso.
3. Implementar o eliminar `/api/disponibilidad` para que no quede un router vacío.
4. Unificar la fuente de verdad de estados: README, `ESTADO.md`, `specs` e implementación.

### Prioridad 3 — Completar documentación para la consigna

1. Crear `docs/` con el documento de definición del TP: tema, 10 CU, stack, integrantes y datos de contacto/GitHub.
2. Agregar `tasks.md` a las features nuevas (no hacer backfill de las ya implementadas, según `ESTADO.md`).
3. Documentar prompts reales y al menos un ciclo de autocorrección con evidencia (mensaje, error, corrección, resultado).
4. Actualizar `README.md` para que no afirme que todos los CU están funcionales mientras 006-010 sean parciales.
5. Alinear `datos_barberia.md` con las tools reales del chatbot.
6. Adjuntar evidencia de tests y, si aplica, capturas o video de demo.

### Prioridad 4 — Robustecer MCP y tests

1. Definir explícitamente si el requisito de "MCP externo" se cumple con el servidor propio de Calendar o si hace falta declarar un MCP de terceros en `opencode.json`.
2. Reintentar la verificación del MCP PostgreSQL con la base levantada.
3. Ampliar tests: al menos un caso feliz y un caso de error por endpoint, más tests del agente y de integraciones.

---

## Anexo: trazabilidad de afirmaciones

| Afirmación | Evidencia | Estado |
|---|---|---|
| El backend arranca en `:3000` | `GET /api/health` → 200; log de arranque | `VERIFICADO` |
| El backend aislado arranca en `:3100` | Log `Servidor de barberia escuchando en el puerto 3100` | `VERIFICADO` |
| El MCP Calendar responde y tiene credenciales | `GET :8000/health` → `ok:true`, `credencialesCargadas:true` | `VERIFICADO` |
| Hay 13 specs y 13 planes | Conteo en `specs/` | `VERIFICADO` |
| No hay `tasks.md` | Conteo en `specs/` = 0 | `VERIFICADO` |
| Las specs se agregaron después del código | `git log --diff-filter=A`: specs en `ba699d4` (2026-10-20); código desde `f7cc27b` (2026-10-09) | `VERIFICADO` |
| `npm test` pasa 8/8 | Ejecución previa | `VERIFICADO` |
| `npm run lint` falla | Ejecución previa; error en `Footer.tsx:18` | `VERIFICADO` |
| El chatbot funciona end-to-end | Sin llamada real ejecutada | `NO VERIFICADO` |
| Los 10 CU funcionan end-to-end | Sin smoke test ejecutado | `NO VERIFICADO` |
| Existe un MCP externo de terceros en el proyecto | `opencode.json` solo declara MCPs propios | `VERIFICADO` que no; `PARCIAL` como requisito |
| El frontend está operativo | Comprobación previa negativa; no se reintentó | `PENDIENTE` |

---

**Fin del informe parcial.** Este documento no reemplaza la auditoría completa: deja el estado actual, la evidencia disponible y los próximos pasos para retomarla sin repetir trabajo.
