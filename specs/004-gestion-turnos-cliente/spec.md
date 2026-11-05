# Feature Specification: Gestión de Turnos del Cliente

**Feature Branch**: `004-gestion-turnos-cliente`

**Created**: 2026-10-20

**Status**: Implemented

**Input**: User description: "CU-04 — Mis turnos: el cliente consulta, cancela y reprograma sus turnos manteniendo sincronizada la agenda externa."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar mis turnos (Priority: P1)

Un cliente ve sus turnos separados en próximos e históricos, con el barbero y el servicio asociados.

**Why this priority**: La consulta es la base de la gestión; sin visibilidad no hay gestión.

**Independent Test**: Se puede probar accediendo a "Mis turnos" con un cliente con turnos y verificando que solo aparecen los suyos, separados por temporalidad.

**Acceptance Scenarios**:

1. **Given** un cliente con turnos, **When** abre "Mis turnos", **Then** ve únicamente sus propios turnos, separados en próximos e históricos.
2. **Given** un cliente sin turnos, **When** abre "Mis turnos", **Then** ve un estado vacío comprensible.

---

### User Story 2 - Cancelar un turno (Priority: P1)

Un cliente cancela un turno en estado pendiente o confirmado, dejándolo en estado cancelado.

**Why this priority**: Cancelar libera agenda y es una operación crítica de autoservicio.

**Independent Test**: Se puede probar cancelando un turno confirmado propio y verificando que su estado pasa a `cancelado`.

**Acceptance Scenarios**:

1. **Given** un turno propio en estado `pendiente` o `confirmado`, **When** el cliente lo cancela, **Then** el estado pasa a `cancelado`.
2. **Given** un turno `completado` o ya `cancelado`, **When** el cliente intenta cancelarlo, **Then** la UI deshabilita la acción y la API responde conflicto (409).
3. **Given** un turno de otro usuario, **When** un cliente intenta cancelarlo, **Then** recibe error de permisos (403).

---

### User Story 3 - Reprogramar un turno (Priority: P2)

Un cliente mueve un turno a otra franja disponible, reflejando el cambio en la agenda.

**Why this priority**: Agrega flexibilidad, pero depende de la consulta de disponibilidad y de las reglas de cancelación.

**Independent Test**: Se puede probar reprogramando un turno a una franja libre y verificando que la nueva fecha/hora queda registrada.

**Acceptance Scenarios**:

1. **Given** un turno propio activo, **When** el cliente lo reprograma a una franja disponible, **Then** el cambio se refleja en la agenda.
2. **Given** una franja ocupada, **When** el cliente intenta reprogramar ahí, **Then** recibe conflicto (409) con mensaje claro.

---

### Edge Cases

- ¿Qué pasa al cancelar/reprogramar un turno `completado` o ya `cancelado`? → rechazo (409) y acciones deshabilitadas en UI.
- ¿Qué pasa si se intenta operar sobre un turno ajeno? → prohibido (403).
- ¿Qué pasa si no se cumple la ventana mínima de cancelación? → rechazo (422); la ventana es un parámetro configurable, no un valor fijo.
- ¿Qué pasa al reprogramar fuera del horario del barbero? → rechazo (422).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir a un cliente autenticado listar sus propios turnos (próximos e históricos) con filtros por estado y rango de fechas.
- **FR-002**: El sistema MUST impedir que un cliente vea u opere sobre turnos de otro usuario.
- **FR-003**: El sistema MUST permitir cancelar un turno propio en estado `pendiente` o `confirmado`, pasándolo a `cancelado`.
- **FR-004**: El sistema MUST impedir cancelar o reprogramar un turno `completado` o ya `cancelado` (conflicto 409).
- **FR-005**: El sistema MUST permitir reprogramar un turno propio a una franja disponible.
- **FR-006**: El sistema MUST rechazar la reprogramación a una franja ocupada (409) o fuera del horario del barbero (422).
- **FR-007**: El sistema MUST reflejar la cancelación y la reprogramación en la agenda externa cuando la integración esté activa (CU-07).
- **FR-008**: El sistema MAY aplicar una ventana mínima de cancelación configurable por parámetro.
- **FR-009**: El sistema MUST exponer la disponibilidad necesaria para reprogramar (reutilizada de CU-03).

### Key Entities

- **Turno**: reserva gestionada por el cliente; atributos: cliente dueño, barbero, servicio, fecha de inicio, fecha de fin, estado, notas.
- **Usuario**: dueño del turno; determina la autorización de las operaciones.
- **Barbero**: profesional asignado; su horario condiciona la reprogramación.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un cliente ve exclusivamente sus propios turnos separados en próximos e históricos (0% de fuga entre usuarios).
- **SC-002**: Cancelar un turno `pendiente`/`confirmado` produce el estado `cancelado` en el 100% de los casos válidos.
- **SC-003**: El 100% de los intentos de cancelar/reprogramar un turno `completado` o `cancelado` es rechazado con 409.
- **SC-004**: El 100% de las operaciones sobre turnos ajenos es rechazado con 403.
- **SC-005**: Reprogramar a una franja ocupada devuelve 409 con mensaje claro en el 100% de los casos.
- **SC-006**: Cada endpoint tiene al menos un test del caso feliz y un caso de error.

## Assumptions

- Alcance: listado, detalle, cancelación y reprogramación.
- Fuera de alcance: reembolsos, penalizaciones, transferencia de turno a otro cliente.
- El cliente está autenticado (ver 001-registro-passkeys) y tiene turnos creados (ver 003-reserva-turnos).
- La sincronización con Google Calendar depende de CU-07 y puede estar pendiente.
- La consulta de disponibilidad se reutiliza de CU-03.
