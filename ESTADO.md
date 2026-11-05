# Auditoría de Implementación — Sistema Barbería

**Fecha de actualización:** 05 de noviembre de 2026
**Metodología:** GitHub Spec Kit — features en `specs/NNN-nombre/` (spec.md + plan.md + tasks.md).
**Backfill documental:** el 26-oct-2026 se reconstruyeron los `tasks.md` de las 13 features a partir de spec, plan, código y esta auditoría. Ese backfill **no** demuestra uso histórico de Spec Kit: los primeros commits de código precedieron a los specs. A partir de ahora el pipeline completo es obligatorio.
**Numeración antigua:** el código "CU-01…CU-10" corresponde a las specs `001…010` (misma numeración).

---

## Tabla de estado por spec

| Spec | Estado | Justificación (1 línea) |
| :--- | :----: | :---------------------- |
| **000-arquitectura** | ✅ Implementada | `plan.md` con capas, modelo de datos completo, árbol de carpetas y decisiones; base de todas las specs. |
| **001-registro-passkeys** | ✅ Implementada | 6 endpoints `/api/auth/*` (WebAuthn v14, cookie HttpOnly firmada) + login/registro en frontend con `useSesion`. **Fix (21-oct):** `verificarLogin` usaba `verificacion` antes de declararla (ReferenceError TDZ) — login 500 permanente desde `1b108e9`; restaurado el lookup de credencial en DB. |
| **002-catalogo-servicios** | ✅ Implementada | CRUD con borrado lógico (`activo`) + `/servicios` con `ServicioCard`/`ServicioFormModal` (alta admin). |
| **003-reserva-turnos** | ✅ Implementada | `POST /api/turnos` valida solapes, bloqueos y jornada laboral; `GET /api/barberos/:id/disponibilidad`; wizard `/reservar` completo. |
| **004-gestion-turnos-cliente** | ✅ Implementada | `PATCH /api/turnos/:id/cancelar` y `/reprogramar` + `/mis-turnos` con próximos/historial filtrados por estado y fecha. |
| **005-panel-barberos** | ✅ Implementada | `/api/barberos/me/*` + `/panel`; agenda excluye cancelados, cálculo en `America/Argentina/Buenos_Aires`, transiciones validadas (incl. `ausente`). Admin: agenda 30 días, filtro por barbero y bloqueos globales. |
| **006-chatbot-langchain** | ⚠️ Parcial | RAG + 4 tools + tool loop (máx. 5 iteraciones) + `ChatWidget` con persistencia por usuario. El reinicio de UI y tests del historial se trazan en el incremento 014; siguen faltando tests del agente (CA-06.9), verificaciones E2E y resolver la contradicción de `datos_barberia.md` (Deuda #5). |
| **007-sync-calendario-mcp** | ⚠️ Parcial | Cliente MCP (`mcp/client.js`), adapter, `integraciones` y servidor MCP autónomo; sync en crear/cancelar/reprogramar con resiliencia; UI en `/panel/configuracion`. Opt-in vía `MCP_CALENDAR_URL`. Del plan falta el endpoint de diagnóstico `/api/asistente/tools`. |
| **008-gestion-disponibilidad** | ⚠️ Parcial | **Implementado:** modelo `Bloqueo`, CRUD `/api/barberos/me/bloqueos`, descuento en disponibilidad, `BloqueosManager`, estado `ausente`. **No implementado del plan:** `/api/barberos/me/horarios`, `/api/admin/feriados` (ni modelo `Feriado`) y el router `/api/disponibilidad` está vacío (404). |
| **009-historial-visitas** | ⚠️ Parcial | **Implementado:** `/api/clientes/buscar`, `/api/clientes/:id/historial`, edición de notas vía `PATCH /api/turnos/:id/notas`. **No implementado del plan:** `/api/clientes/me/ficha` y `/api/clientes/:id/ficha` (campos preferencias/observaciones). |
| **010-notificaciones-estado** | ⚠️ Parcial | **Implementado:** modelo `Notificacion`, listar/leer/leer-todas, disparo ante cambios de estado, `NotificationBell`. **No implementado del plan:** preferencias, recordatorios y proveedor de email. |
| **011-metricas-dashboard** | ✅ Implementada | `GET /api/metricas` y `/api/barberos/me/metricas` (rangos opcionales) + `/panel/metricas`. |
| **012-vista-clientes** | ✅ Implementada | `GET /api/clientes` con `_count.turnos` + resumen (tráfico/gasto) en historial; `/panel/clientes` con listado, filtro y ficha. |
| **014-chat-reinicio-conversacion** | ⚠️ Parcial | Acción autenticada con confirmación, borrado antes de limpiar UI, control de concurrencia y errores no sensibles; 6 tests de historial aprobados. Lint y TypeScript pasan; queda pendiente la interacción manual en navegador real. Incrementa FR-008 de 006. |
| **015-entorno-docker-compose** | ✅ Implementada | `docker-compose.yml` con frontend (:3001) y backend (:3000), hot-reload verificado y volúmenes para `node_modules`/`.next`. PostgreSQL y MCP Calendar siguen fuera del compose. |

---

## Correcciones aplicadas (21-oct-2026)

- **fix(auth):** `backend/src/services/auth.service.js:151` — restaurado `usuario.credenciales.find((c) => c.credentialId === body.response.id)` en `verificarLogin`. El commit `1b108e9` lo había reemplazado por `verificacion.registrationInfo.credential`, usándolo antes de declarar la variable (TDZ → ReferenceError → 500 en todo login).
- **test(auth):** nuevo `backend/src/tests/auth.test.js` (4 tests: happy path con actualización de counter, 404 sin usuario, 400 sin challenge, 400 con credencial ajena). Suite total: **8/8 en verde**.
- **fix(api):** contrato de errores unificado `{ error: true, message }` en los últimos 2 emisores del shape viejo del contrato REST: `middlewares/notFound.middleware.js` y `controllers/integraciones.controller.js`.
- **chore(repo):** eliminado `odd/` (tracking del flujo ODD/RDD pre-Spec-Kit, obsoleto), `.atl/`, `.gitkeep` residuales en carpetas con contenido, carpetas vacías `repositories/` y `types/`, y `.env` de raíz (redundante con `backend/.env`). `make-admin.ts` movido a `backend/scripts/`.

---

## Mejora SDD aplicada (26-oct-2026)

- **fix(frontend):** `frontend/src/components/layout/Footer.tsx` — reemplazado `useState` + `useEffect` por `useSyncExternalStore` con snapshot de servidor de respaldo. Elimina el error `react-hooks/set-state-in-effect` y evita el error de prerender de `new Date()` en Next.js 16.
- **Verificación:** lint con 0 errores (3 advertencias preexistentes), typecheck sin errores, build de producción completado en copia aislada con Turbopack y HTML verificado por HTTP (año 2026 y tres enlaces).
- **Limitación:** el build dentro del repositorio no completó en el intento (timeout); el servidor de desarrollo activo comparte `.next`. Se validó en una copia aislada.
- **Trazabilidad:** `specs/013-footer-anio/` y `docs/sdd/REGISTRO_MEJORAS_SDD.md`.

## Incremento SDD 014 — Reinicio de conversación (26-oct-2026)

- **Frontend:** `ChatWidget.tsx` ofrece reinicio solo con sesión autenticada, confirma antes de borrar y bloquea envíos/reinicios concurrentes. Usa el `sesionId` propio (incluida la restauración pendiente), limpia la vista solo tras `{ ok: true }`, tolera `localStorage` no disponible y presenta mensajes genéricos de error salvo el caso controlado `401`.
- **Backend:** se conserva el contrato existente y la verificación de propiedad; no se modificaron turnos, Google Calendar, RAG ni tools.
- **Verificación:** `npm test` en `backend/`: 14/14; `npm run lint` en `frontend/`: 0 errores y 3 advertencias preexistentes; `npx tsc --noEmit`: sin errores.
- **Limitación:** no se verificó la interacción en navegador real. No se ejecutó build porque los servidores activos en `:3000` y `:3001` usan el repositorio; no se detuvieron procesos.
- **Trazabilidad:** 014 amplía/completa la acción de UI de FR-008 de 006; ambas permanecen `Partial` por verificaciones E2E y deuda de tests del agente.

---

## Incremento SDD 015 — Entorno Docker Compose (05-nov-2026)

- **Infraestructura:** `docker-compose.yml` en la raíz con servicios `frontend` y `backend`, red `barberia-net` y volúmenes nombrados para `node_modules` y `.next`.
- **Frontend:** `frontend/Dockerfile.dev` (Node 20 bookworm-slim), `.dockerignore` y `watchOptions.pollIntervalMs` condicionado a `NEXT_WATCH_POLL=true` para el hot-reload con Turbopack sobre bind mounts de Windows.
- **Backend:** `backend/Dockerfile.dev` con `openssl` y generación de Prisma, `.dockerignore`; conecta al PostgreSQL del host vía `host.docker.internal`.
- **Verificación:** `docker compose config` OK; `docker compose up -d --build` OK; `:3001` respondió 200 y `:3000/api/health` respondió `{ status: "ok" }`; hot-reload de frontend y reinicio de `nodemon` verificados con cambios reales desde el host; contextos de build de 5.27 kB (frontend) y 4.10 kB (backend); lint 0 errores (3 advertencias preexistentes) y TypeScript sin errores.
- **Limitación:** no se verificaron flujos que dependen de PostgreSQL porque el contenedor de base de datos no estaba corriendo; el MCP de Calendar sigue fuera del compose.
- **Trazabilidad:** `specs/015-entorno-docker-compose/` y `README.md`.

---

## Deuda técnica conocida

1. **`tasks.md` reconstruidos (backfill documental, 26-oct-2026)** — se ejecutaron `/speckit.specify` y `/speckit.plan` antes de los `tasks.md`; los 13 archivos se reconstruyeron retrospectivamente desde spec, plan, código y esta auditoría. El backfill no sustituye el uso histórico de `/speckit.tasks`; el pipeline completo se aplicó en `013-footer-anio` y es obligatorio en adelante. Además, muchas tareas de prueba siguen `[ ]` porque no hay evidencia de ejecución.
2. **Doble sistema de validación** — `utils/validators.js` (imperativo, lanza `AppError`, usado por 8 services) y `utils/validation.js` (zod, usado por 2 controllers). Mismo dato validado dos veces con dos shapes de error distintos. Pendiente de unificar.
3. **`VENTANA_CANCELACION_HORAS=0`** (sin límite de cancelación) contradice la política de "mínimo 2 horas" documentada en `datos_barberia.md`.
4. **Seed incompleto vs catálogo documentado** — `prisma/seed.js` siembra 4 de 6 servicios (faltan Corte Niño y Coloración) y 2 de 3 barberos (falta Tomás). Además el modelo de un único horario por barbero no representa el horario corto de sábado (10-18) del documento de negocio.
5. **`datos_barberia.md` contradice al chatbot** — el documento (fuente del RAG) afirma que el asistente "NO puede crear ni cancelar turnos", pero las tools `reservar_turno` y `cancelar_turno` (`agent/tools.js`) sí lo hacen. Requiere decisión: actualizar el documento o restringir el prompt.
6. **`/api/disponibilidad`** — router vacío montado en el app (responde 404). Candidato a eliminar o implementar.
7. **Cobertura de tests** — 8 tests sobre services de turnos y auth; sin tests de controllers, middlewares, agent, integraciones ni frontend.
8. **Encoding dañado (mojibake)** residual en algunos archivos (p. ej. `backend/scripts/make-admin.ts`, `backend/src/tests/turnos.test.js`).

---

## Estado de infraestructura (verde)

- **Migraciones Prisma:** 2/2 aplicadas y up to date (`init` + `add_bloqueos_y_notificaciones`).
- **Contrato de errores:** uniforme `{ error: true, message }` en toda la API REST; el frontend lo consume vía `ApiError` en `lib/api/client.ts`.
- **MCPs:** `postgres-local` (stdio, solo lectura) y `google-calendar` (HTTP, paquete autónomo) implementados, con script npm y declarados en `opencode.json`.
- **Scripts npm:** backend y frontend verificados, sin targets rotos.
- **Rutas backend:** 12 módulos registrados en `routes/index.js`, sin imports rotos.
- **Especificaciones:** 15 entradas con `spec.md` + `plan.md` + `tasks.md`: 13 features preexistentes (000-012, backfill 26-oct-2026) y los incrementos 013 (footer) y 014 (reinicio de chat). 006/014 permanecen Partial por verificaciones pendientes; 008/009/010 siguen Partial por contratos del plan aún no implementados.

---

**Resumen:** 8 specs completas de negocio (000-005, 011, 012), 1 mejora transversal implementada (013) y 6 parciales (006-010 y 014). Sin specs sin implementar. Última auditoría: 26-oct-2026 sobre `752ec9f`; el incremento 014 deja cambios posteriores sin commit.
