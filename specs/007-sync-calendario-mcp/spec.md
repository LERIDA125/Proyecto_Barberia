# Feature Specification: Sincronización con Google Calendar (MCP)

**Feature Branch**: `007-sync-calendario-mcp`

**Created**: 2026-10-20

**Status**: Partial

**Input**: User description: "CU-07 — Integración de agenda externa: cada turno confirmado/reprogramado/cancelado se refleja como un evento en Google Calendar, a través de un servidor MCP externo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reflejar turnos en la agenda externa (Priority: P1)

Cuando un turno se confirma, reprograma o cancela, el evento correspondiente se crea, actualiza o elimina en Google Calendar, y el turno guarda su identificador de evento.

**Why this priority**: Es el objetivo central del caso de uso: mantener la agenda externa consistente con la del sistema.

**Independent Test**: Se puede probar confirmando un turno y verificando que aparece un evento en el calendario y que el turno guarda el identificador del evento; luego reprogramando y verificando que el evento se actualiza sin duplicarse.

**Acceptance Scenarios**:

1. **Given** un turno confirmado, **When** se sincroniza, **Then** se crea un evento en Google Calendar y se guarda su identificador en el turno.
2. **Given** un turno ya sincronizado que se reprograma, **When** se sincroniza, **Then** el evento existente se actualiza (no se duplica).
3. **Given** un turno cancelado, **When** se sincroniza, **Then** el evento se elimina o se marca como cancelado de forma consistente.

---

### User Story 2 - Resiliencia ante caída de la integración (Priority: P1)

Si el servidor MCP no está disponible, el turno se conserva y queda marcado como sincronización pendiente, sin romper el flujo de reserva.

**Why this priority**: La operación de la barbería no debe bloquearse por una dependencia externa.

**Independent Test**: Se puede probar creando un turno con la integración deshabilitada y verificando que el turno se persiste y queda en estado pendiente de sincronización.

**Acceptance Scenarios**:

1. **Given** el servidor MCP no disponible, **When** se confirma un turno, **Then** el turno se persiste y se registra "sincronización pendiente".
2. **Given** un fallo del servidor MCP o de la API de Google, **When** se produce, **Then** el sistema responde con un error controlado y registra el estado.

---

### User Story 3 - Gestión y observabilidad de la integración (Priority: P2)

Un administrador ve el estado de la conexión y puede forzar la sincronización de un turno; el personal autorizado puede consultar los eventos del calendario.

**Why this priority**: Facilita la operación y el diagnóstico, pero no es indispensable para sincronizar.

**Independent Test**: Se puede probar abriendo el panel de integración (estado conectado/desconectado) y forzando la sincronización de un turno puntual.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** consulta el estado de la integración, **Then** ve si está conectada, el calendario destino y la última sincronización.
2. **Given** un turno no sincronizado, **When** el administrador fuerza la sincronización, **Then** el evento se crea o actualiza.
3. **Given** un fallo de conexión, **When** el administrador reintenta, **Then** el sistema intenta reconectar y refleja el resultado.

---

### Edge Cases

- ¿Qué pasa si expira o rota el token de acceso? → refrescar y reconectar sin exponer credenciales.
- ¿Qué pasa ante reintentos que podrían duplicar eventos? → sincronización idempotente usando el identificador del evento.
- ¿Qué pasa ante un desfase horario? → fijar la zona horaria y usar timestamps absolutos.
- ¿Qué pasa si el estado del turno no es sincronizable? → rechazo con conflicto (409) o inexistente (404).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST crear un evento en Google Calendar al confirmar un turno y guardar su identificador en el turno.
- **FR-002**: El sistema MUST actualizar el evento existente al reprogramar un turno, sin duplicarlo.
- **FR-003**: El sistema MUST eliminar o marcar como cancelado el evento al cancelar un turno, de forma consistente.
- **FR-004**: El sistema MUST persistir el turno y registrar "sincronización pendiente" si el servidor MCP no está disponible.
- **FR-005**: El sistema MUST exponer el estado de la conexión de la integración al administrador.
- **FR-006**: El sistema MUST permitir al administrador forzar la sincronización de un turno puntual.
- **FR-007**: El sistema MUST manejar las credenciales OAuth exclusivamente por variables de entorno, sin exponerlas ni loguearlas.
- **FR-008**: El backend MUST NOT invocar la API de Google directamente: toda interacción pasa por las tools del servidor MCP.
- **FR-009**: El sistema MUST permitir al personal autorizado consultar los eventos del calendario en un rango de fechas.
- **FR-010**: El sistema MUST nominar el título del evento según el servicio y el cliente, con la descripción incluyendo barbero y notas.
- **FR-011**: La sincronización MUST ser idempotente respecto del identificador de evento del turno.

### Key Entities

- **Turno**: reserva sincronizada; atributo relevante: identificador del evento externo (puede estar vacío hasta sincronizar).
- **Evento de calendario**: representación del turno en la agenda externa; atributos: identificador, título, inicio, fin, descripción.
- **Integración de calendario**: estado de la conexión; atributos: conectado, calendario destino, última sincronización.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los turnos confirmados genera un evento externo y guarda su identificador.
- **SC-002**: Reprogramar un turno produce exactamente 1 evento (0 duplicados) por turno.
- **SC-003**: Cancelar un turno deja el evento externo eliminado o marcado como cancelado de forma consistente con el estado local.
- **SC-004**: Con el servidor MCP caído, el 100% de los turnos se persiste y queda en estado "sincronización pendiente" (0 pérdidas de turno).
- **SC-005**: El 100% de las credenciales OAuth circula solo por variables de entorno (0 credenciales en logs o respuestas).
- **SC-006**: Ninguna llamada directa a la API de Google desde el backend (0 llamadas fuera del módulo MCP).
- **SC-007**: Cada endpoint tiene al menos un test del caso feliz y un caso de error (MCP caído).

## Assumptions

- Alcance: crear, actualizar, consultar y eliminar eventos; registrar el identificador de evento en el turno.
- Fuera de alcance: múltiples proveedores de calendario e invitaciones por email a clientes.
- Estado actual: parcial; el cliente, el adapter, el servicio de integración, los endpoints administrativos y el servidor MCP están presentes en código. La sincronización se invoca al crear, cancelar y reprogramar, y degrada a pendiente si la integración falla. No hay evidencia registrada de creación, actualización o eliminación real de eventos ni de reconexión end-to-end.
- Se asume que existen credenciales válidas de Google Calendar (cuenta de servicio o OAuth con refresh token), provistas fuera del repositorio; su validez no está verificada por esta especificación.
- El servidor MCP de Calendar forma parte del repositorio y se ejecuta como proceso separado; su disponibilidad no está garantizada.
- Los flujos de creación/reprogramación/cancelación dependen de CU-03 y CU-04.
