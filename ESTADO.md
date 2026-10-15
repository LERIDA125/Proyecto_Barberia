# Auditoría de Implementación — Sistema Barbería

**Fecha de actualización:** 13 de octubre de 2026

_Nota: Esta auditoría refleja el estado real del código (Next.js en frontend y Node.js/Express en backend) y de los modelos de Prisma/PostgreSQL, sin modificaciones de archivos._

## Tabla de estado por CU

| CU                                 |    Estado    | Justificación (1 línea)                                                                                                                                                                              |
| :--------------------------------- | :----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **CU-01 Autenticación (passkeys)** | ✅ Funcional | `routes/auth.routes.js` (registro/login opciones+verificar, sesión, logout) + `pages/login` y `pages/registro` con WebAuthn y `useSesion`.                                                        |
| **CU-02 Catálogo servicios**       | ✅ Funcional | `servicios.controller.js` CRUD + borrado lógico (DELETE→activo) y `pages/servicios` con `ServicioCard/ServicioFormModal` (alta admin).                                                            |
| **CU-03 Reservas**                 | ✅ Funcional | `POST /api/turnos` con validación de solapamiento y bloqueos (`turnos.service.js`) + `GET /api/barberos/:id/disponibilidad` y wizard `/reservar` completo.                                       |
| **CU-04 Mis Turnos**               | ✅ Funcional | `PATCH /api/turnos/:id/cancelar` y `/reprogramar` + `pages/mis-turnos` (próximos/historial, `CancelarTurnoDialog`, `ReprogramarDialog`). Próximos = futuros y no `completado`; Historial = `completado` o fecha pasada. |
| **CU-05 Panel Barberos**           | ✅ Funcional | Página `/panel` (`TurnoPanelCard`, `useMiAgenda`) + `GET /api/barberos/me/agenda` y `PATCH /api/turnos/:id/estado`; resumen del día y cambio de estado (incl. `ausente`). La agenda excluye turnos `cancelado` y el rango default "hoy" se calcula en `America/Argentina/Buenos_Aires`. |
| **CU-06 Chatbot IA**               |  ⚠️ Parcial  | Fase 1 (RAG `POST /api/chat`) + **Fase 2**: tools `consultar_disponibilidad`/`reservar_turno`/`consultar_mis_turnos`/`cancelar_turno` (`agent/tools.js`), tool loop y endpoints autenticados; `ChatWidget` con `apiFetch` (cookies), gate por `useSesion` e indicador de tools. **Fix aplicado (13-oct):** la conversación se persiste en `localStorage` scoped por usuario y se restaura el historial en mount. Faltan tests (CA-06.9). |
| **CU-07 Google Calendar**          |  ⚠️ Parcial  | Cliente MCP (`mcp/client.js`), adapter (`mcp/google-calendar.js`), `integraciones` (service/controller/routes) y **servidor MCP externo** (`src/mcp/google-calendar/`, paquete autónomo con `googleapis`); sync en crear/cancelar/reprogramar con resiliencia. Falta la UI (`/configuracion/integraciones`). |
| **CU-08 Ausencias**                | ✅ Funcional | Modelo `Bloqueo` + `GET/POST/DELETE /api/barberos/me/bloqueos`; `disponibilidad()` y alta/reprogramación descuentan bloqueos; `BloqueosManager` en `/panel` + estado `ausente`. **Migración aplicada (13-oct):** `add_bloqueos_y_notificaciones`. |
| **CU-09 Fichas de Cliente**        | ✅ Funcional | `GET /api/clientes/buscar` y `/:id/historial` + página `/panel/clientes` (ficha, historial y edición de notas vía `PATCH /api/turnos/:id/notas`). **Ampliado:** ver "Vista de Clientes" abajo. |
| **CU-10 Notificaciones**           | ✅ Funcional | Modelo `Notificacion` + `GET /api/notificaciones` y `PATCH /leer-todas` (y `/:id/leer`); turnos disparan notificaciones; `NotificationBell` en `Navbar`. **Migración aplicada (13-oct):** `add_bloqueos_y_notificaciones`. |

## Features nuevas (specs ODD)

| Feature                           |    Estado    | Justificación (1 línea)                                                                                                                                                                              |
| :-------------------------------- | :----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Vista de Clientes** (`spec-vista-clientes.md`) | ✅ Funcional | `GET /api/clientes` (listado con `_count.turnos`, orderBy nombre) + `resumen` (tráfico y gasto total) en `GET /api/clientes/:id/historial`; página `/panel/clientes` con listado, filtro/sort client-side y ficha con resumen. Commits `ed95d25` / `4fdd264`. |
| **Dashboard de Métricas** (`spec-metricas-dashboard.md`) | ✅ Funcional | `GET /api/metricas` (admin-only): ingresos, ocupación de agenda y top servicios en rango de fechas opcional; página `/panel/metricas` + nav admin-only. Commits `1fcabb3` / `96d80fd`. |
| **Panel Admin — Agenda 30 días**  | ✅ Funcional | Commit `d3cb5a1` (`Ampliacion_Agenda`): `rangoFechas` default extendido a 30 días, título "Agenda próxima (30 días)" y fecha legible (es-AR) en `TurnoPanelCard`. |

## Hallazgos transversales

- **Migraciones aplicadas (13-oct):** se creó y registró `20261013120000_add_bloqueos_y_notificaciones` (tablas `bloqueos`/`notificaciones`, índices, FKs y enum `ausente`). Las tablas ya existían en runtime desde antes (verificadas: `bloqueos` 0 filas / `notificaciones` 22 filas) y la migración se marcó como aplicada **sin ejecutar SQL destructivo ni reset** (ruta segura frente al reset que habría pedido `migrate dev` por drift). `prisma migrate status` → **2 migraciones, up to date**. En una base nueva, `prisma migrate deploy` crea todo desde `init`.
- **Review nativa RDD:** los slices de `metricas-dashboard` y `ampliacion-agenda` se cerraron por **aprobación humana explícita** (13-oct) salteando la revisión nativa: el lifecycle no es ingresable en este runtime (`immutable_review_transport_unsupported`). No quedó acción pendiente. Ver `odd/tasks/metricas-dashboard.md` y `odd/tasks/ampliacion-agenda.md`.
- **Endpoints Vacíos (Stubs):** solo `/api/disponibilidad` sigue siendo un Router vacío (404). `clientes`, `notificaciones` e `integraciones` ya están implementados.
- **Modelo de datos:** `Usuario`, `Barbero`, `Bloqueo`, `Servicio`, `Turno` (con `notas` y `googleEventId`), `CredencialPasskey`, `Notificacion`.
- **CU-07:** la integración es **opt-in**: sin `MCP_CALENDAR_URL` queda deshabilitada y los turnos se persisten igual (sync "pendiente" = `googleEventId` null). El backend actúa como cliente MCP y **no** llama a la API de Google directamente (cliente MCP con `fetch` de Node 18+, sin dependencias nuevas). El servidor MCP externo vive en `backend/src/mcp/google-calendar/` como **paquete autónomo** (su propio `package.json`), preservando el aislamiento (CA-07.7 / SDD "MCP encapsulado").
- **CU-05:** el cambio de estado (`PATCH /api/turnos/:id/estado`) valida transiciones e incorpora `ausente`; el panel de barberos ya lo consume.
- **Tests:** 0 archivos de test en el repo → deuda transversal que afecta el DoD (Definition of Done) de todos los CU. Pendiente por decisión explícita (no se escriben tests en esta etapa).

**Resumen:** 10 CUs completos (CU-01→05, CU-08, CU-09, CU-10 + features Vista de Clientes, Métricas y Agenda 30 días) y 2 parciales (CU-06, CU-07). Sin CU pendientes. Migraciones al día (2/2). Fuente: rama `feature/clientes` (`d3cb5a1`), sin cambios pendientes en working tree.