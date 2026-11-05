# Feature Specification: Reserva de Turnos

**Feature Branch**: `003-reserva-turnos`

**Created**: 2026-10-20

**Status**: Implemented

**Input**: User description: "CU-03 — Flujo de reserva (UI y chatbot): el cliente reserva un turno seleccionando servicio, barbero, fecha y hora disponible. La sincronización con Google Calendar (CU-07) queda fuera de alcance del MVP."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reserva guiada paso a paso (Priority: P1)

Un cliente reserva un turno seleccionando servicio, barbero, fecha y una hora disponible, y lo confirma desde la interfaz paso a paso.

**Why this priority**: Es la razón de ser del sistema; sin reserva no hay negocio operativo.

**Independent Test**: Se puede probar completando el wizard (servicio → barbero → fecha/hora → confirmación) y verificando que el turno queda registrado en estado confirmado.

**Acceptance Scenarios**:

1. **Given** un cliente autenticado y franjas libres, **When** completa el wizard de reserva, **Then** el turno se crea en estado `confirmado`.
2. **Given** un cliente elige barbero y fecha, **When** consulta disponibilidad, **Then** el sistema ofrece solo franjas realmente libres (sin solapamiento).
3. **Given** una franja ya ocupada, **When** el cliente intenta reservarla, **Then** el sistema responde con conflicto (409) y la UI lo informa.
4. **Given** una fecha/hora pasada o fuera del horario del barbero, **When** el cliente intenta reservar, **Then** el sistema rechaza la reserva.

---

### User Story 2 - Reserva por lenguaje natural (Priority: P2)

Un cliente reserva conversando con el asistente, obteniendo la misma validación de negocio que el flujo de UI.

**Why this priority**: Aporta valor diferencial, pero depende del flujo base de reserva y de las tools del agente (CU-06).

**Independent Test**: Se puede probar pidiendo una reserva por chat y verificando que se aplican las mismas reglas (sin solapamiento, horario, fecha futura).

**Acceptance Scenarios**:

1. **Given** un cliente autenticado, **When** solicita una reserva por chat con confirmación explícita, **Then** el turno se crea con la misma validación que la API (sin solapamientos).

---

### Edge Cases

- ¿Qué pasa ante dos reservas simultáneas de la misma franja? → validación transaccional; una gana y la otra recibe conflicto.
- ¿Qué pasa si no hay franjas disponibles para la fecha elegida? → la UI informa "sin disponibilidad".
- ¿Qué pasa si el servicio, barbero o cliente no existe o está inactivo? → error 404/400.
- La duración del turno se toma del servicio reservado; no es libre.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir a un cliente autenticado crear un turno indicando barbero, servicio y fecha de inicio.
- **FR-002**: El sistema MUST calcular la duración del turno a partir de la duración del servicio seleccionado.
- **FR-003**: El sistema MUST ofrecer únicamente franjas realmente disponibles para el barbero y fecha elegidos (sin solapamiento).
- **FR-004**: El sistema MUST rechazar con conflicto (409) la reserva de una franja ya ocupada.
- **FR-005**: El sistema MUST rechazar reservas en fechas u horas pasadas.
- **FR-006**: El sistema MUST rechazar reservas fuera del horario laboral del barbero.
- **FR-007**: El sistema MUST validar la existencia y el estado activo del servicio, barbero y cliente antes de crear el turno.
- **FR-008**: El sistema MUST persistir el turno en estado `confirmado`.
- **FR-009**: El cliente MUST poder reservar mediante el asistente conversacional con la misma validación que la API.
- **FR-010**: El sistema MUST bloquear la creación de turno a usuarios no autenticados.
- **FR-011**: La confirmación del turno MUST mostrarse al cliente (UI y/o chat).

### Key Entities

- **Turno**: reserva de un servicio con un barbero en una fecha/hora concretas; atributos: cliente, barbero, servicio, fecha de inicio, fecha de fin, estado, notas.
- **Barbero**: profesional que atiende el turno; atributos relevantes: horario laboral, días laborales, estado activo.
- **Servicio**: prestación reservada; atributos relevantes: duración, precio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un cliente completa la reserva (servicio, barbero, fecha, hora disponible) y obtiene confirmación en un solo flujo guiado.
- **SC-002**: El 100% de las franjas ofrecidas están libres para el barbero y fecha elegidos (0 solapamientos en pruebas de reserva concurrente).
- **SC-003**: El 100% de los intentos de reservar una franja ocupada recibe respuesta 409 y feedback visible en la UI.
- **SC-004**: El 100% de los intentos de reservar en fecha pasada o fuera de horario son rechazados.
- **SC-005**: Un cliente puede reservar por lenguaje natural obteniendo la misma validación que el flujo de UI.
- **SC-006**: Cada endpoint tiene al menos un test del caso feliz y un caso de error (solapamiento).

## Assumptions

- Alcance: consulta de disponibilidad, creación y confirmación de turno.
- Fuera de alcance: pagos, seña/depósito, listas de espera, sincronización con Google Calendar (CU-07).
- En el MVP el turno se persiste con `google_event_id = null`; la integración MCP externa se retoma con CU-07.
- El cliente está autenticado (ver 001-registro-passkeys) y el catálogo/barberos existen (ver 002 y 008).
- El asistente conversacional depende de CU-06.
