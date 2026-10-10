# Auditoría de Implementación — Sistema Barbería

**Fecha de actualización:** 10 de octubre de 2026

_Nota: Esta auditoría refleja el estado real del código (Next.js en frontend y Node.js/Express en backend) y de los modelos de Prisma/PostgreSQL, sin modificaciones de archivos._

## Tabla de estado por CU

| CU                                 |    Estado    | Justificación (1 línea)                                                                                                                                                                              |
| :--------------------------------- | :----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **CU-01 Autenticación (passkeys)** | ✅ Funcional | `routes/auth.routes.js` (registro/login opciones+verificar, sesión, logout) + `pages/login` y `pages/registro` con WebAuthn y `useSesion`.                                                        |
| **CU-02 Catálogo servicios**       | ✅ Funcional | `servicios.controller.js` CRUD + borrado lógico (DELETE→activo) y `pages/servicios` con `ServicioCard/ServicioFormModal` (alta admin).                                                            |
| **CU-03 Reservas**                 | ✅ Funcional | `POST /api/turnos` con validación de solapamiento y bloqueos (`turnos.service.js`) + `GET /api/barberos/:id/disponibilidad` y wizard `/reservar` completo.                                       |
| **CU-04 Mis Turnos**               | ✅ Funcional | `PATCH /api/turnos/:id/cancelar` y `/reprogramar` + `pages/mis-turnos` (próximos/historial, `CancelarTurnoDialog`, `ReprogramarDialog`).                                                          |
| **CU-05 Panel Barberos**           | ✅ Funcional | Página `/panel` (`TurnoPanelCard`, `useMiAgenda`) + `GET /api/barberos/me/agenda` y `PATCH /api/turnos/:id/estado`; resumen del día y cambio de estado (incl. `ausente`).                         |
| **CU-06 Chatbot IA**               |  ⚠️ Parcial  | Fase 1 (RAG `POST /api/chat`) + **Fase 2**: tools `consultar_disponibilidad`/`reservar_turno`/`consultar_mis_turnos`/`cancelar_turno` (`agent/tools.js`), tool loop y endpoints autenticados; `ChatWidget` con `apiFetch` (cookies), gate por `useSesion` e indicador de tools. Faltan tests (CA-06.9). |
| **CU-07 Google Calendar**          |  ⚠️ Parcial  | Cliente MCP (`mcp/client.js`), adapter (`mcp/google-calendar.js`), `integraciones` (service/controller/routes) y **servidor MCP externo** (`src/mcp/google-calendar/`, paquete autónomo con `googleapis`); sync en crear/cancelar/reprogramar con resiliencia. Falta la UI (`/configuracion/integraciones`). |
| **CU-08 Ausencias**                | ✅ Funcional | Modelo `Bloqueo` + `GET/POST/DELETE /api/barberos/me/bloqueos`; `disponibilidad()` y alta/reprogramación descuentan bloqueos; `BloqueosManager` en `/panel` + estado `ausente`. **Requiere migración.** |
| **CU-09 Fichas de Cliente**        | ✅ Funcional | `GET /api/clientes/buscar` y `/:id/historial` + página `/panel/clientes` (ficha, historial y edición de notas vía `PATCH /api/turnos/:id/notas`).                                                |
| **CU-10 Notificaciones**           | ✅ Funcional | Modelo `Notificacion` + `GET /api/notificaciones` y `PATCH /leer-todas` (y `/:id/leer`); turnos disparan notificaciones; `NotificationBell` en `Navbar`. **Requiere migración.**                 |

## Hallazgos transversales

- **Endpoints Vacíos (Stubs):** solo `/api/disponibilidad` sigue siendo un Router vacío (404). `clientes`, `notificaciones` e `integraciones` ya están implementados.
- **Modelo de datos:** `Usuario`, `Barbero`, `Bloqueo`, `Servicio`, `Turno` (con `notas` y `googleEventId`), `CredencialPasskey`, `Notificacion`.
- **Migraciones pendientes (las corre el usuario):** CU-08 (`cu08_bloqueos_y_ausente`) y CU-10 (`cu10_notificaciones`). Sin aplicarlas, `prisma.bloqueo`/`prisma.notificacion` no existen en runtime. CU-07 y CU-09 **no** requieren migración (`notas` ya estaba en el schema).
- **CU-07:** la integración es **opt-in**: sin `MCP_CALENDAR_URL` queda deshabilitada y los turnos se persisten igual (sync "pendiente" = `googleEventId` null). El backend actúa como cliente MCP y **no** llama a la API de Google directamente (cliente MCP con `fetch` de Node 18+, sin dependencias nuevas). El servidor MCP externo vive en `backend/src/mcp/google-calendar/` como **paquete autónomo** (su propio `package.json` con `express`/`cors`/`googleapis`/`dotenv`), preservando el aislamiento (CA-07.7 / SDD "MCP encapsulado").
- **CU-05:** el cambio de estado (`PATCH /api/turnos/:id/estado`) valida transiciones e incorpora `ausente`; el panel de barberos ya lo consume.
- **CU-06 (resuelto):** `ChatWidget.tsx` ahora usa `apiFetch` (con `credentials: "include"` y `NEXT_PUBLIC_API_URL`) contra `POST /api/chat`, condiciona el chat con `useSesion` (muestra "Inicia sesión para chatear con nuestro asistente" si no hay sesión) y muestra un indicador "consultando la agenda…" durante la espera más etiquetas de las tools invocadas (`toolInvocadas`).
- **Tests:** 0 archivos de test en el repo → deuda transversal que afecta el DoD (Definition of Done) de todos los CU.

**Resumen:** 8 completos (CU-01→05, CU-08, CU-09, CU-10) y 2 parciales (CU-06, CU-07). Sin CU pendientes.
