# ESTADO.md — Proyecto Sistema Barbería (SDD)

> Reporte de estado para retomar el desarrollo en otra sesión/IA.
> Actualizado: 2026-10-09.

---

## 1. Resumen general

- **Monorepo:** `backend/` (Node + Express 5 + Prisma 7 + PostgreSQL + LangChain.js 0.3.x), `frontend/` (Next.js 16 + React 19 + Tailwind v4 + TypeScript), `specs/` (10 casos de uso), `SDD.md`, `IA_WORKFLOW.md`, `AGENTS.md`.
- **Tests automatizados:** NO existen (0 archivos de test). Toda la verificación fue manual (curl/HTTP).
- **Base de datos:** ✅ migrada y poblada. `DATABASE_URL=postgresql://barberia:barberia@localhost:5436/barberia` (contenedor Docker `barberia-postgres`, `postgres:16-alpine`, puerto **5436** para no chocar con otros proyectos). Migración `20261009212920_init` aplicada y `prisma/seed.js` ejecutado (1 admin, 2 barberos, 4 servicios, 1 cliente). Schema en `backend/prisma/schema.prisma`: `Usuario`, `Barbero`, `Servicio`, `Turno`, `CredencialPasskey`, enums `Rol` (`cliente|barbero|admin`) y `EstadoTurno` (`pendiente|confirmado|cancelado|completado`).
- **WebAuthn:** `WEBAUTHN_ORIGIN=http://localhost:3001` (frontend Next.js) y `WEBAUTHN_RP_ID=localhost`. Registro/login por passkey listo para validar en navegador.
- **Git:** nunca hubo commits (todo untracked). Los `.env` están gitignored (`backend/.gitignore`, `.gitignore` raíz).
- **Ramas técnicas a respetar:**
  - LangChain.js **pinned a 0.3.x** (la 1.x rompe por peer-deps con `dotenv@18`). Instalar/actualizar paquetes LRU con `--legacy-peer-deps`.
  - Embeddings locales: `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`, 384 dim). Modelo se descarga 1 vez (~90 MB).
  - Modelos Groq activos del plan: `qwen/qwen3.8-27b`, `openai/gpt-oss-20b`, `openai/gpt-oss-120b`. **`llama-3.1-8b-instant` ya no existe en Groq (404).**
  - Backend corre en puerto `3000`; Next.js en puerto `3001`.

---

## 2. Casos de uso — estado por capa

| CU | Spec | Backend | Frontend | Tests |
|---|---|---|---|---|
| **CU-01** Registro/Login passkeys | Aprobado e impl. | ✅ completo | ✅ login + registro | ❌ |
| **CU-02** Catálogo de servicios | Impl. | ✅ CRUD + borrado lógico + auth admin | ✅ lista + admin (crear/editar/desactivar) | ❌ |
| **CU-03** Reserva de turnos | ✅ Aprobado e implementado (excepción MVP: sin Google Calendar) | ✅ crear (validación sin solapamientos) + obtener | ✅ wizard (servicio → barbero → franja) + `/reservar` | ❌ |
| **CU-04** Gestión turnos cliente | Backend impl. | ✅ listar/cancelar/reprogramar (ventana `VENTANA_CANCELACION_HORAS`) | ✅ `/mis-turnos` (próximos + historial, cancelar/reprogramar) | ❌ |
| **CU-05** Panel barbero | Backend impl. | ✅ agenda, estados, disponibilidad, métricas | ❌ | ❌ |
| **CU-06** Chatbot | Backend RAG impl. (Fase 1) | ✅ `POST /api/chat` + `/api/asistente/mensaje` + historial | ❌ (ChatWidget = Fase 2) | ❌ |
| **CU-07** Sync Google Calendar MCP | Borrador | ❌ (solo campo `googleEventId` en schema) | ❌ | ❌ |
| **CU-08** Gestión disponibilidad | Borrador | ⚠️ parcial (disponibilidad por `diasLaborales`, **sin modelo `Bloqueo`**) | ❌ | ❌ |
| **CU-09** Historial de visitas | Borrador | ❌ | ❌ | ❌ |
| **CU-10** Notificaciones de estado | Borrador | ❌ | ❌ | ❌ |

---

## 3. Qué SÍ está implementado

### Backend (`backend/src/`)

- **Auth (CU-01)** — `routes/auth.routes.js`:
  `POST /api/auth/registro/opciones`, `POST /api/auth/registro/verificar`, `POST /api/auth/login/opciones`, `POST /api/auth/login/verificar`, `GET /api/auth/sesion`, `POST /api/auth/logout`. Passkeys con `@simplewebauthn/server` (v14), sesión por cookie con firma HMAC (`SESSION_SECRET`), challenges con TTL.
- **Servicios (CU-02)** — `routes/servicios.routes.js`:
  `GET /api/servicios` (público, auth opcional), `GET /api/servicios/:id`, `POST|PATCH|DELETE /api/servicios` (admin, borrado lógico con `activo`).
- **Turnos (CU-03/04)** — `routes/turnos.routes.js` (todos autenticados):
  `POST /api/turnos` (crear, valida solapamientos), `GET /api/turnos` (mis turnos), `GET /api/turnos/:id`, `PATCH /api/turnos/:id/cancelar`, `PATCH /api/turnos/:id/reprogramar`, `PATCH /api/turnos/:id/estado` (transiciones validadas).
- **Barberos (CU-05 y CU-08 parcial)** — `routes/barberos.routes.js`:
  `GET /api/barberos/me/agenda`, `GET|PUT /api/barberos/me/disponibilidad`, `GET /api/barberos/me/metricas`, `GET /api/barberos`, `GET /api/barberos/:id/agenda`, `GET /api/barberos/:id/disponibilidad`.
- **Asistente (CU-06 Fase 1)** — `routes/chat.routes.js` + `routes/asistente.routes.js`:
  - `POST /api/chat` body `{ pregunta, sesionId? }` → `{ respuesta, conversacionId, toolInvocadas: [] }` (acepta `mensaje` como alias de `pregunta`).
  - `POST /api/asistente/mensaje` (igual), `GET /api/asistente/historial?sesionId=...`, `DELETE /api/asistente/historial?sesionId=...`.
  - RAG: `src/agent/` (embeddings.js, vectorStore.js → `backend/data/vector_db.json`, llm.js Groq/Ollama, prompts.js recepcionista, conversations.js → `backend/data/conversaciones/`). Fuente del conocimiento: `datos_barberia.md` (raíz, definida por `ASISTENTE_DOC`).
  - Errores: `400` sin pregunta, `503` sin base de conocimiento, fallback de disculpa si el proveedor LLM falla.
- **Extras:** `GET /api/health`; middlewares `auth.middleware` (`requiereAuth`, `authOpcional`, `requiereRol(admin)`), `error.middleware`, `notFound`.
- **Endpoints STUB (rutas montadas, SIN handlers):** `/api/clientes`, `/api/disponibilidad`, `/api/notificaciones`, `/api/integraciones`.

### Frontend (`frontend/src/`, App Router, puerto 3001)

- Páginas: `/` (landing), `/servicios` (catálogo + gestión admin), `/login`, `/registro`, `/reservar` (wizard CU-03, server-rendered on-demand con `searchParams` & `servicio`), `/mis-turnos` (CU-04).
- `components/layout/Navbar.tsx` con estado de sesión; store `useSesion` (useSyncExternalStore). Links "Reservar" y "Mis turnos" solo para usuarios logueados. `ServicioCard` pasó a navegar a `/reservar?servicio=<id>`.
- `lib/api/`: `client.ts` (fetch con `credentials: include`, `ApiError`), `servicios.ts`, `auth.ts` (WebAuthn: `startRegistration`/`startAuthentication`), `barberos.ts` (`getBarberos`, `getDisponibilidad`), `turnos.ts` (`getTurnos`, `crearTurno`, `cancelarTurno`, `reprogramarTurno`).
- `lib/hooks/`: `useServicios.ts`, `useSesion.ts`, `useWebAuthnSoportado.ts`, `useTurnos.ts`, `useDisponibilidad.ts` (fetch de franjas derivado del estado, sin setState síncrono en efectos).
- `components/ui/`: Button, Card, Badge, Input, Modal, Skeleton, EmptyState, StatusMessage, **Stepper, EstadoBadge**. `components/servicios/`: ServicioCard, ServicioFormModal. `components/auth/`: LoginForm, RegistroForm. `components/reservar/`: OpcionSeleccionable, StepServicio, StepBarbero, StepFechaHora, SelectorFranjas (reutilizado en reprogramación), StepConfirmacion, **ReservarWizard (al confirmar redirige a `/mis-turnos`)**, ReservaExitosa (hoy sin uso desde el wizard). `components/turnos/`: TurnoCard, CancelarTurnoDialog, ReprogramarDialog.
- `types/api.ts` con contratos (suma `FranjaHoraria`, `Disponibilidad`, `TurnoInput`). Lint + typecheck + build OK (`npm run lint`, `npx tsc --noEmit`, `npm run build`). Slate++ fijo por lint (reglas `react-hooks/set-state-in-effect` y `static-components` de Next 16).
- NO consume aún los endpoints de barberos (panel) ni del asistente (no hay páginas CU-05 ni chat).

### Docs

- `specs/spec-cu01..cu10` (10 casos), `SDD.md`, `IA_WORKFLOW.md`, `AGENTS.md` (roles y DoD), `README.md` (referencia Python de la cátedra).

---

## 4. Prioridades para la siguiente sesión (orden sugerido)

1. ~~**Desbloquear la DB (bloqueante):**~~ ✅ **HECHO** — DB PostgreSQL dedicada (`barberia-postgres`, puerto 5436), migración `init` aplicada y seed con admin/barberos/servicios/cliente.
2. ~~**Fix WebAuthn:**~~ ✅ **HECHO** — `WEBAUTHN_ORIGIN=http://localhost:3001` en `backend/.env`. Pendiente validar flujo completo en navegador (el admin sembrado no tiene passkey).
3. ~~**Frontend turnos (CU-03/04):**~~ ✅ **HECHO** — wizard `/reservar` (servicio → barbero → día/franja → confirmar; al crear el turno **redirige a `/mis-turnos`**) y `/mis-turnos` (próximos + historial, cancelar con motivo, reprogramar en 14 días). Pendiente **validar en navegador** (registrar un usuario nuevo; el admin sembrado no tiene passkey).
4. **Frontend panel barbero (CU-05):** agenda del día, cambio de estados, disponibilidad GET/PUT, métricas.
5. **Tests** (deuda grande): caso feliz + error por endpoint con services/LLM mockeados (CA-*.8, CA-06.9).
6. **CU-06 Fase 2:** tools LangChain `consultarDisponibilidad/crearTurno/misTurnos/cancelarTurno` delegando en los services existentes, `usuarioId` desde la sesión (nunca del texto del usuario), confirmación antes de escrituras; luego `ChatWidget` en frontend.
7. **CU-07** Google Calendar vía MCP (la spec tiene la arquitectura teórica), **CU-08** completo (agregar modelo `Bloqueo`), **CU-09**, **CU-10**.

---

## 5. Advertencias y decisiones a conocer

- La spec de CU-03 fue actualizada a **"Aprobado e implementado"** (decisión MVP autorizada: creación de turno solo en PostgreSQL con estado `confirmado` y `googleEventId=null`; CU-07 queda pendiente). Ver `specs/spec-cu03-reserva-turnos.md` §4.1.
- Frontend (2026-10-09): se corrigieron errores de sintaxis que rompían `tsc`/`build` en `StepServicio`, `LoginForm` y `RegistroForm`, y el typo `Modal aberto` → `abierto` en `Modal`, `ReprogramarDialog`, `CancelarTurnoDialog`. `npx tsc --noEmit` y `npm run build` vuelven a pasar.
- **Convención del `Button`:** la prop de estilo es `variante` (no `variant`). Usar `variant=` compila solo si es atributo DOM, pero no aplica estilos y tsc lo rechaza.
- El bot responde solo lo que está en el Markdown (servicios/precios/horarios/barberos); **no** reserva ni cancela turnos todavía.
- Frontend: `reservar/page.tsx` usa `export const instant = false` (Next 16 con `cacheComponents`) porque lee `searchParams` en un server component; `mis-turnos/page.tsx` es 100% cliente (estática).
- Al reprogramar, la franja actual del turno no se excluye explícitamente del selector en el diálogo (el backend la ignora al descartar el propio turno); reprogramar a la misma hora es un no-op legítimo.
- El estado de los diálogos de cancelar/reprogramar se resetea con `key={turno?.id}` en la página para no arrastrar selecciones entre turnos.
- `datos_barberia.md` es la fuente del conocimiento del bot; mover/renombrar ese archivo rompe `ASISTENTE_DOC`.
- Cositético: `dotenv@18` imprime `◇ injected env (...) from .env` en stderr (inofensivo).
- La demo Python de la cátedra (`ingest.py`, `chat.py`, `requirements.txt`, `politicas-rh.md`) vive en la raíz como referencia; no forma parte del sistema.
- Al instalar paquetes LangChain usar `--legacy-peer-deps` y respetar el pin `0.3.x`.