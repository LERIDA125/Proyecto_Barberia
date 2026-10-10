# spec-cu07-sync-calendario-mcp.md

> **Caso de Uso:** CU-07 — Sincronización con Google Calendar vía MCP Externo
> **Feature:** Integración de agenda externa
> **Rol autor:** Arquitecto / Tech Lead
> **Estado:** Borrador para revisión
> **Metodología:** Spec-Driven Development — ver `IA_WORKFLOW.md` y `SDD.md`

---

## 1. Descripción

Sincronizar los turnos de la barbería con **Google Calendar** mediante un **servidor MCP externo**, de modo que cada turno confirmado/reprogramado/cancelado se refleje como un evento en el calendario correspondiente. El backend actúa como **cliente MCP** y consume las tools expuestas por el servidor.

**Actores:** Backend (cliente MCP), Barbero/Admin (consume el calendario), Servidor MCP (Google Calendar).
**Alcance:** crear, actualizar, consultar y eliminar eventos; registrar el `google_event_id` en el turno. **Fuera de alcance:** múltiples proveedores de calendario, invitaciones por email a clientes.

---

## 2. Configuración Teórica del Servidor MCP Externo

### 2.1 Modelo de Integración

- El **servidor MCP** encapsula la API de Google Calendar (OAuth 2.0 + Calendar API).
- El **backend** es el cliente MCP: descubre las tools y las invoca pasando credenciales/contexto.
- Transporte: **stdio** (proceso local gestionado por el backend) o **SSE/HTTP** (servicio remoto). Decisión inicial: **SSE/HTTP** para desacoplar despliegue; `stdio` como alternativa de desarrollo.

### 2.2 Variables de Entorno (servidor MCP)

| Variable | Descripción |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | ID de cliente OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | Secreto del cliente OAuth 2.0 |
| `GOOGLE_REDIRECT_URI` | URI de callback OAuth |
| `GOOGLE_REFRESH_TOKEN` | Token de refresco de la cuenta de la barbería |
| `CALENDAR_ID` | ID del calendario destino (ej. `primary` o el de cada barbero) |
| `TIMEZONE` | Zona horaria (ej. `America/Argentina/Buenos_Aires`) |

### 2.3 Configuración (ejemplo conceptual, no código fuente)

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

### 2.4 Tools Expuestas por el Servidor MCP

| Tool | Entrada | Salida |
|------|---------|--------|
| `crearEvento` | `{ titulo, inicio, fin, descripcion?, asistentes? }` | `{ eventId, htmlLink }` |
| `actualizarEvento` | `{ eventId, inicio?, fin?, titulo?, descripcion? }` | `{ eventId, actualizado: true }` |
| `eliminarEvento` | `{ eventId }` | `{ eliminado: true }` |
| `consultarEventos` | `{ desde, hasta, calendarId? }` | `Evento[]` |
| `verificarConexion` | `{}` | `{ conectado: boolean, calendarId }` |

### 2.5 Estrategia de Sincronización

- **Al confirmar turno (CU-03):** `crearEvento` → guardar `google_event_id` en el turno.
- **Al reprogramar (CU-04):** `actualizarEvento` del evento existente.
- **Al cancelar (CU-04):** `eliminarEvento` (o marcar como cancelado).
- **Título del evento:** `"Turno: <servicio> - <cliente>"`; descripción con barbero y notas.

---

## 3. Endpoints REST (Node.js)

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

---

## 4. Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `IntegracionesPage` | `app/configuracion/integraciones/page.tsx` | Panel de estado de la integración. |
| `CalendarStatusCard` | `components/integraciones/CalendarStatusCard.tsx` | Estado de conexión y última sincronización. |
| `SyncTurnoButton` | `components/integraciones/SyncTurnoButton.tsx` | Botón para re-sincronizar un turno. |
| `EstadoBadge` | `components/ui/EstadoBadge.tsx` | Indica "sincronizado" / "pendiente" (reutilizable). |
| `Toast` | `components/ui/Toast.tsx` | Notifica éxito/error de sincronización (reutilizable). |

**Estados de UI:** conectado, desconectado, sincronizando, error con acción "reintentar".

---

## 5. Criterios de Aceptación

- [ ] **CA-07.1** Al confirmar un turno, se crea un evento en Google Calendar y se guarda el `google_event_id` en el turno.
- [ ] **CA-07.2** Al reprogramar un turno, el evento existente se actualiza (no se duplica).
- [ ] **CA-07.3** Al cancelar un turno, el evento se elimina o se marca como cancelado de forma consistente.
- [ ] **CA-07.4** Si el servidor MCP no está disponible, el turno se persiste igualmente y se registra el estado "sincronización pendiente".
- [ ] **CA-07.5** Un administrador puede ver el estado de la conexión y forzar la sincronización de un turno.
- [ ] **CA-07.6** Las credenciales OAuth se manejan solo por variables de entorno y nunca se exponen ni se loguean.
- [ ] **CA-07.7** El backend no invoca la API de Google directamente: toda interacción pasa por las tools del MCP.
- [ ] **CA-07.8** Existe test del caso feliz y de un caso de error (MCP caído) por endpoint.

---

## 6. Dependencias

- `Turno.google_event_id` (SDD) y flujos de CU-03/CU-04.
- Servidor MCP externo de Google Calendar y credenciales OAuth.
- Módulo backend `mcp/google-calendar`.

## 7. Riesgos

- Expiración/rotación de tokens → manejar refresh y reconexión.
- Duplicación de eventos por reintentos → sincronización **idempotente** usando `google_event_id`.
- Desfase horario → fijar `TIMEZONE` y usar timestamps absolutos.
