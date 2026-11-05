# Feature Specification: Panel de Barberos

**Feature Branch**: `005-panel-barberos`

**Created**: 2026-10-20

**Status**: Implemented

**Input**: User description: "CU-05 — Agenda y gestión operativa del barbero: ver agenda diaria/semanal, actualizar el estado de sus turnos y administrar su disponibilidad."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Agenda del barbero (Priority: P1)

Un barbero autenticado ve su agenda diaria y semanal con los turnos asignados a él.

**Why this priority**: Es el núcleo operativo del barbero; sin agenda no puede trabajar.

**Independent Test**: Se puede probar accediendo al panel con un barbero con turnos asignados y verificando que ve su agenda diaria y semanal.

**Acceptance Scenarios**:

1. **Given** un barbero con turnos asignados, **When** abre su panel, **Then** ve la agenda diaria y semanal correspondiente.
2. **Given** un barbero sin turnos, **When** abre su panel, **Then** ve un estado sin turnos comprensible.

---

### User Story 2 - Actualizar estado de turnos (Priority: P1)

Un barbero marca sus turnos como confirmados o completados, respetando las transiciones válidas.

**Why this priority**: El ciclo de vida del turno (confirmar/completar) es indispensable para la operación diaria.

**Independent Test**: Se puede probar marcando un turno confirmado como completado y verificando que el estado cambia y que las transiciones inválidas se rechazan.

**Acceptance Scenarios**:

1. **Given** un turno `confirmado` asignado al barbero, **When** lo marca como `completado`, **Then** el estado se actualiza.
2. **Given** un turno `pendiente` asignado al barbero, **When** lo marca como `confirmado`, **Then** el estado se actualiza.
3. **Given** una transición inválida (p. ej. `completado` → `pendiente`), **When** el barbero la intenta, **Then** la UI la oculta y la API responde conflicto (409).
4. **Given** un turno asignado a otro barbero, **When** el barbero intenta modificarlo, **Then** recibe error de permisos (403).

---

### User Story 3 - Administrar disponibilidad y ver métricas (Priority: P2)

Un barbero actualiza su horario y días laborales, y consulta métricas básicas del día/semana.

**Why this priority**: Complementa la operación; los cambios de horario impactan la disponibilidad pública.

**Independent Test**: Se puede probar editando horario y días laborales y verificando que el cambio afecta la disponibilidad mostrada a los clientes; y viendo las métricas básicas del período.

**Acceptance Scenarios**:

1. **Given** un barbero autenticado, **When** actualiza su horario y días laborales, **Then** el cambio afecta la disponibilidad mostrada a los clientes (CU-03).
2. **Given** un barbero con actividad, **When** abre las métricas, **Then** ve turnos del día/semana, completados y cancelados.
3. **Given** un administrador, **When** consulta/edita la agenda de cualquier barbero, **Then** puede hacerlo.

---

### Edge Cases

- ¿Qué pasa si el horario es incoherente (`inicio >= fin`) o los días están fuera del rango 0–6? → rechazo (400).
- ¿Qué pasa al modificar el horario con turnos ya reservados? → validar y advertir (coherencia entre disponibilidad y turnos).
- ¿Qué pasa si un barbero intenta editar turnos ajenos? → prohibido (403).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar a un barbero autenticado su agenda diaria y semanal con los turnos asignados.
- **FR-002**: El sistema MUST permitir al barbero actualizar el estado de sus turnos dentro de las transiciones válidas (`pendiente → confirmado → completado`; `cancelado` desde `pendiente`/`confirmado`).
- **FR-003**: El sistema MUST rechazar transiciones de estado inválidas con conflicto (409) y ocultarlas en la UI.
- **FR-004**: El sistema MUST permitir al barbero modificar únicamente los turnos asignados a él (403 en los ajenos).
- **FR-005**: El sistema MUST permitir al barbero actualizar su horario y días laborales, afectando la disponibilidad mostrada a los clientes.
- **FR-006**: El sistema MUST validar la coherencia del horario (`inicio < fin`) y de los días laborales (subconjunto 0–6).
- **FR-007**: El sistema MUST mostrar métricas básicas del día/semana (turnos, completados, cancelados).
- **FR-008**: El sistema MUST permitir al administrador consultar y editar la agenda de cualquier barbero.
- **FR-009**: El sistema MUST mostrar la agenda con los datos del cliente y del servicio asociados a cada turno.

### Key Entities

- **Barbero**: profesional; atributos: especialidad, horario de inicio/fin, días laborales, estado activo.
- **Turno**: reserva asignada al barbero; atributos: cliente, servicio, fecha/hora, estado.
- **Usuario**: identidad del barbero; determina permisos (barbero vs admin).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un barbero ve su agenda diaria y semanal completa con los turnos asignados.
- **SC-002**: El 100% de las transiciones de estado válidas se aplican correctamente (confirmar, completar).
- **SC-003**: El 100% de las transiciones inválidas se rechaza con 409 y no está disponible en la UI.
- **SC-004**: El 100% de los intentos de modificar turnos ajenos es rechazado con 403.
- **SC-005**: Un cambio de horario del barbero se refleja en la disponibilidad pública de la siguiente consulta (CU-03).
- **SC-006**: El panel muestra métricas básicas del período sin errores de render.
- **SC-007**: Cada endpoint tiene al menos un test del caso feliz y un caso de error.

## Assumptions

- Alcance: agenda del barbero, cambio de estado de turnos y edición de horarios.
- Fuera de alcance: gestión de pagos/liquidaciones y vacaciones (futuro).
- Existen identidades con rol barbero (ver 001-registro-passkeys) y turnos (ver 003-reserva-turnos).
- La disponibilidad pública se calcula en CU-03/CU-08 y consume el horario del barbero.
