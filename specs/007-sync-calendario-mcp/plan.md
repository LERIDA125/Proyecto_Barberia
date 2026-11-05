# Implementation Plan: Sincronización con Google Calendar (MCP)

**Branch**: `007-sync-calendario-mcp` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-sync-calendario-mcp/spec.md`

**Estado:** Borrador para revisión (Parcial).

## Summary

El backend actúa como cliente MCP de un servidor externo que encapsula la API de Google Calendar (OAuth 2.0 + Calendar API). Cada turno confirmado/reprogramado/cancelado se refleja como evento, y el turno guarda su identificador. El backend nunca llama a Google directamente: toda interacción pasa por las tools del MCP.

## Configuración Teórica del Servidor MCP Externo

### Modelo de Integración

- El **servidor MCP** encapsula la API de Google Calendar (OAuth 2.0 + Calendar API).
- El **backend** es el cliente MCP: descubre las tools y las invoca pasando credenciales/contexto.
- Transporte: **stdio** (proceso local gestionado por el backend) o **SSE/HTTP** (servicio remoto). Decisión inicial: **SSE/HTTP** para desacoplar despliegue; `stdio` como alternativa de desarrollo.

### Variables de Entorno (servidor MCP)

| Variable | Descripción |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | ID de cliente OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | Secreto del cliente OAuth 2.0 |
| `GOOGLE_REDIRECT_URI` | URI de callback OAuth |
| `GOOGLE_REFRESH_TOKEN` | Token de refresco de la cuenta de la barbería |
| `CALENDAR_ID` | ID del calendario destino (ej. `primary` o el de cada barbero) |
| `TIMEZONE` | Zona horaria (ej. `America/Argentina/Buenos_Aires`) |

### Configuración (ejemplo conceptual, no código fuente)

```jsonc
{
  "mcpServers": {
    "google-calendar": {
      "transport": "sse",
      "url": "http://localhost:7800/sse",
      "env": {
        "GOOGLE_CLIENT_ID": "${GOOGLE_CLIENT_ID}",
        "GOOGLE_CLIENT_SECRET": "${GOOGLE_CLIENT_SECRET}",
        "GOOGLE_REFRESH_TOKEN": "${GOOGLE_REFRESH_TOKEN}",
        "CALENDAR_ID": "${CALENDAR_ID}",
        "TIMEZONE": "America/Argentina/Buenos_Aires"
      }
    }
  }
}
```

### Tools Expuestas por el Servidor MCP

| Tool | Entrada | Salida |
|------|---------|--------|
| `crearEvento` | `{ titulo, inicio, fin, descripcion?, asistentes? }` | `{ eventId, htmlLink }` |
| `actualizarEvento` | `{ eventId, inicio?, fin?, titulo?, descripcion? }` | `{ eventId, actualizado: true }` |
| `eliminarEvento` | `{ eventId }` | `{ eliminado: true }` |
| `consultarEventos` | `{ desde, hasta, calendarId? }` | `Evento[]` |
| `verificarConexion` | `{}` | `{ conectado: boolean, calendarId }` |

### Estrategia de Sincronización

- **Al confirmar turno (CU-03):** `crearEvento` → guardar `google_event_id` en el turno.
- **Al reprogramar (CU-04):** `actualizarEvento` del evento existente.
- **Al cancelar (CU-04):** `eliminarEvento` (o marcar como cancelado).
- **Título del evento:** `"Turno: <servicio> - <cliente>"`; descripción con barbero y notas.

## Endpoints REST (Node.js)

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| `GET` | `/api/integraciones/calendar/estado` | Estado de la conexión MCP (conectado/desconectado). | Admin |
| `POST` | `/api/integraciones/calendar/sincronizar/:turnoId` | Fuerza la sincronización de un turno. | Admin |
| `GET` | `/api/integraciones/calendar/eventos` | Lista eventos del calendario (`?desde=&hasta=`). | Barbero / Admin |
| `POST` | `/api/integraciones/calendar/reconectar` | Reautentica la integración (flujo OAuth). | Admin |

**Contratos (alto nivel):**
- `estado` ⇒ `{ conectado, calendarId, ultimaSync }`.
- Los endpoints delegan en el módulo `mcp/google-calendar` (nunca llaman a la API de Google directamente).

**Errores esperados:** `401` credenciales OAuth inválidas, `502` fallo del servidor MCP/Google, `404` turno inexistente, `409` estado no sincronizable.

## Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `IntegracionesPage` | `app/configuracion/integraciones/page.tsx` | Panel de estado de la integración. |
| `CalendarStatusCard` | `components/integraciones/CalendarStatusCard.tsx` | Estado de conexión y última sincronización. |
| `SyncTurnoButton` | `components/integraciones/SyncTurnoButton.tsx` | Botón para re-sincronizar un turno. |
| `EstadoBadge` | `components/ui/EstadoBadge.tsx` | Indica "sincronizado" / "pendiente" (reutilizable). |
| `Toast` | `components/ui/Toast.tsx` | Notifica éxito/error de sincronización (reutilizable). |

**Estados de UI:** conectado, desconectado, sincronizando, error con acción "reintentar".

## Dependencias y Riesgos

- `Turno.google_event_id` (modelo maestro) y flujos de CU-03/CU-04.
- Servidor MCP externo de Google Calendar y credenciales OAuth.
- Módulo backend `mcp/google-calendar`.
- **Riesgos:** expiración/rotación de tokens → manejar refresh y reconexión; duplicación de eventos por reintentos → sincronización **idempotente** usando `google_event_id`; desfase horario → fijar `TIMEZONE` y usar timestamps absolutos.

## Technical Context

**Language/Version**: Backend Node.js (JavaScript); Frontend Next.js (App Router, TypeScript)

**Primary Dependencies**: LangChain (transporte MCP), Tailwind CSS

**Storage**: PostgreSQL (MCP local) + API de Google Calendar (vía MCP externo)

**Testing**: suite automatizada pendiente; test del caso feliz y un caso de error (MCP caído) por endpoint (CA-07.8); `node --check` (backend)

**Target Platform**: Web + servicio MCP externo (SSE/HTTP; stdio como alternativa)

**Project Type**: web-service + web application + integración MCP externa

**Performance Goals**: sincronización fuera del camino crítico de la reserva (degradación a "pendiente")

**Constraints**: credenciales solo por variables de entorno; ninguna llamada directa a Google; idempotencia por `google_event_id`

**Scale/Scope**: un local; un calendario (o uno por barbero)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec antes que código**: PASS — plan derivado de `spec.md` en estado Partial/borrador.
- **II. Gates secuenciales**: PASS — feature en borrador; CU-03/CU-04 del MVP operan con identificador de evento nulo.
- **III. Contratos primero**: PASS — contratos de tools MCP y endpoints definidos en la spec.
- **IV. Testing obligatorio**: PASS CON PENDIENTE — CA-07.8 sin suite automatizada.
- **V. Modularidad y capas**: PASS — MCP encapsulado en `mcp/google-calendar`; ningún módulo externo invoca Google.

## Project Structure

### Documentation (this feature)

```text
specs/007-sync-calendario-mcp/
├── plan.md
└── spec.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── mcp/google-calendar/   # cliente MCP externo (crear/actualizar/eliminar/consultar)
│   ├── routes/                # integraciones.routes
│   ├── controllers/           # integraciones.controller
│   └── services/              # sincronizacion/compensacion con turnos
└── tests/

frontend/
└── src/
    ├── app/configuracion/integraciones/   # page.tsx
    └── components/
        ├── integraciones/                 # CalendarStatusCard, SyncTurnoButton
        └── ui/                            # EstadoBadge, Toast
```

**Structure Decision**: se agrega el módulo MCP externo bajo `mcp/google-calendar` y la vista de integración bajo `app/configuracion/integraciones`.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
