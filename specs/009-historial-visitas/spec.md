# Feature Specification: Historial de Visitas (Fichas de Cliente)

**Feature Branch**: `009-historial-visitas`

**Created**: 2026-10-20

**Status**: Partial — historial y ficha staff implementados; endpoints `/me`, filtros y contadores del plan pendientes. Ver `ESTADO.md` y `tasks.md`.

**Input**: User description: "CU-09 — Registro histórico de turnos y preferencias: el cliente consulta el historial de sus visitas y el barbero/admin ve la ficha e historial de un cliente."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Historial de visitas del cliente (Priority: P1)

Un cliente ve su historial de visitas completadas en orden cronológico, con filtro por rango de fechas y contadores de total de visitas y última visita.

**Why this priority**: Es el valor principal del caso de uso: dar visibilidad al cliente sobre su relación con la barbería.

**Independent Test**: Se puede probar con un cliente que tiene turnos completados y verificando el orden cronológico, los contadores y el filtro por fechas.

**Acceptance Scenarios**:

1. **Given** un cliente con turnos completados, **When** abre su historial, **Then** ve las visitas en orden cronológico.
2. **Given** un historial con visitas, **When** el cliente lo consulta, **Then** ve contadores de total de visitas y fecha de la última.
3. **Given** un historial cargado, **When** el cliente filtra por rango de fechas, **Then** solo se muestran las visitas del rango.

---

### User Story 2 - Ficha y observaciones del cliente (Priority: P2)

Un cliente ve y actualiza sus propios datos y observaciones; el staff autorizado ve la ficha completa.

**Why this priority**: Enriquece la atención personalizada, pero el historial ya entrega valor sin la ficha editable.

**Independent Test**: Se puede probar actualizando las observaciones propias y verificando que persisten y que solo el staff autorizado las ve cuando corresponde.

**Acceptance Scenarios**:

1. **Given** un cliente autenticado, **When** actualiza sus datos/observaciones, **Then** los cambios persisten y son visibles para el staff autorizado.
2. **Given** un cliente, **When** intenta ver el historial o la ficha de otro cliente, **Then** recibe error de permisos (403).

---

### User Story 3 - Búsqueda y fichas para el staff (Priority: P2)

El staff busca clientes y consulta la ficha completa con historial reciente para atención personalizada.

**Why this priority**: Apoya la operación diaria del barbero/admin, dependiendo de contar con fichas e historial.

**Independent Test**: Se puede probar buscando un cliente como staff y verificando que la ficha e historial se muestran completos.

**Acceptance Scenarios**:

1. **Given** un barbero/admin autenticado, **When** busca un cliente, **Then** ve su ficha con datos, preferencias y observaciones.
2. **Given** un cliente con historial, **When** el staff abre su ficha, **Then** ve el historial reciente de visitas.

---

### Edge Cases

- ¿Qué pasa si un cliente no tiene visitas? → estado vacío comprensible.
- ¿Qué pasa con turnos que no están completados? → no aparecen en el historial de visitas.
- ¿Qué pasa con filtros de fecha inválidos? → rechazo (400).
- Privacidad: las observaciones no son visibles para otros clientes.
- Volumen alto de historial: paginación e índices por cliente y fecha.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar al cliente su historial de visitas completadas en orden cronológico.
- **FR-002**: El historial MUST incluir contadores de total de visitas y fecha de la última visita.
- **FR-003**: El cliente MUST poder filtrar su historial por rango de fechas.
- **FR-004**: El sistema MUST construir el historial únicamente a partir de turnos en estado `completado`.
- **FR-005**: El sistema MUST permitir al cliente ver y actualizar sus propios datos y observaciones.
- **FR-006**: El sistema MUST permitir al staff autorizado buscar clientes y ver ficha e historial completos.
- **FR-007**: El sistema MUST impedir que un cliente vea el historial o la ficha de otro cliente (403).
- **FR-008**: El sistema MUST mostrar las observaciones de la ficha únicamente al staff autorizado.
- **FR-009**: El sistema MUST validar los filtros de fecha y responder con error explícito si son inválidos.
- **FR-010**: El sistema MAY paginar el historial para clientes con muchas visitas.

### Key Entities

- **Usuario/Cliente**: dueño del historial y la ficha; atributos: datos de contacto, preferencias, observaciones.
- **Turno**: fuente del historial; atributos relevantes: fecha, servicio, barbero, importe, estado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un cliente ve su historial de visitas completadas en orden cronológico correcto.
- **SC-002**: Los contadores (total de visitas y última visita) coinciden exactamente con los turnos completados del cliente.
- **SC-003**: Filtrar por rango de fechas restringe el historial al rango indicado en el 100% de los casos.
- **SC-004**: El staff puede buscar un cliente y ver su ficha e historial sin errores.
- **SC-005**: El 100% de los intentos de un cliente de ver historial/ficha ajena es rechazado con 403.
- **SC-006**: Las observaciones solo son visibles para el staff autorizado (0 exposiciones a otros clientes).
- **SC-007**: El 100% de los turnos listados en el historial está en estado `completado`.
- **SC-008**: Cada endpoint tiene al menos un test del caso feliz y un caso de error.

## Assumptions

- Alcance: consulta de historial y ficha de cliente.
- Fuera de alcance: fidelización/puntos y programas de recompensas.
- Existen identidades con rol cliente/barbero/admin (ver 001-registro-passkeys) y turnos (ver 003-reserva-turnos, 004-gestion-turnos-cliente).
- Requiere campos de ficha/observaciones del cliente (escalar al modelo maestro en `specs/000-arquitectura/plan.md`).
- El historial se apoya en consultas históricas sobre la persistencia (ver 000-arquitectura).
