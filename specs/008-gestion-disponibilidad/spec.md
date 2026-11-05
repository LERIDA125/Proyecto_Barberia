# Feature Specification: Gestión de Disponibilidad y Ausencias

**Feature Branch**: `008-gestion-disponibilidad`

**Created**: 2026-10-20

**Status**: Partial — bloqueos implementados; horarios laborales configurables, feriados y `/api/disponibilidad` pendientes. Ver `ESTADO.md` y `tasks.md`.

**Input**: User description: "CU-08 — Motor de disponibilidad, bloqueos y excepciones: definir y gestionar las reglas que determinan qué franjas horarias están disponibles para reservar (horarios laborales por barbero, bloqueos puntuales y feriados)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cálculo de disponibilidad real (Priority: P1)

El sistema calcula qué franjas están disponibles combinando horario laboral del barbero, turnos ocupados, bloqueos y feriados globales.

**Why this priority**: Es la base del flujo de reserva (CU-03); sin disponibilidad confiable no se puede reservar correctamente.

**Independent Test**: Se puede probar consultando la disponibilidad de un barbero en una fecha con turnos, bloqueos y feriados y verificando que solo se ofrecen franjas libres.

**Acceptance Scenarios**:

1. **Given** un barbero con horario y turnos ocupados, **When** se consulta la disponibilidad, **Then** el sistema ofrece únicamente las franjas libres resultantes.
2. **Given** una fecha con un feriado global, **When** se consulta la disponibilidad de cualquier barbero, **Then** no se ofrecen franjas ese día.

---

### User Story 2 - Horarios laborales (Priority: P1)

Un barbero define sus días y horas laborales y el resultado afecta la disponibilidad pública que ven los clientes.

**Why this priority**: El horario es el insumo primario del motor de disponibilidad y de CU-05.

**Independent Test**: Se puede probar configurando los horarios semanales y verificando que la disponibilidad pública se ajusta a ellos.

**Acceptance Scenarios**:

1. **Given** un barbero autenticado, **When** define sus días y horas laborales, **Then** la disponibilidad ofrecida a los clientes refleja esa configuración.
2. **Given** un horario incoherente (`inicio >= fin`) o un día fuera de rango, **When** el barbero lo guarda, **Then** el sistema lo rechaza.

---

### User Story 3 - Bloqueos y ausencias (Priority: P2)

Un barbero crea y elimina bloqueos (ausencias, descansos) por rango de fecha, y el sistema advierte si se solapan con turnos confirmados.

**Why this priority**: Los bloqueos son una excepción frecuente pero de menor criticidad que el cálculo base y el horario.

**Independent Test**: Se puede probar creando un bloqueo sobre una franja libre (se guarda) y sobre una franja con turno confirmado (advierte con conflicto).

**Acceptance Scenarios**:

1. **Given** un barbero autenticado y una franja libre, **When** crea un bloqueo, **Then** el bloqueo se guarda y resta disponibilidad.
2. **Given** un bloqueo que se solapa con turnos confirmados, **When** se intenta guardar, **Then** el sistema advierte con conflicto (409).
3. **Given** un bloqueo existente, **When** el barbero lo elimina, **Then** la disponibilidad se restituye.

---

### Edge Cases

- ¿Qué pasa al cambiar horarios con turnos ya reservados? → validar y advertir.
- ¿Qué pasa con un bloqueo que solapa turnos confirmados? → conflicto (409) antes de guardar.
- ¿Qué pasa con franjas generadas cuando el servicio tiene duración particular? → las franjas se generan en intervalos iguales a la duración del servicio.
- Zona horaria: centralizar el cálculo para evitar divergencias.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST calcular la disponibilidad real combinando horario laboral, turnos ocupados, bloqueos y feriados globales.
- **FR-002**: El sistema MUST generar las franjas disponibles en intervalos iguales a la duración del servicio consultado.
- **FR-003**: El sistema MUST permitir al barbero definir sus días y horas laborales, afectando la disponibilidad pública.
- **FR-004**: El sistema MUST validar la coherencia del horario (`inicio < fin`) y de los días (0–6).
- **FR-005**: El sistema MUST permitir al barbero crear y eliminar bloqueos por rango de fecha con motivo.
- **FR-006**: El sistema MUST advertir (conflicto 409) cuando un bloqueo se solapa con turnos confirmados.
- **FR-007**: El sistema MUST permitir al administrador registrar feriados globales que restan disponibilidad a todos los barberos.
- **FR-008**: El sistema MUST exponer la disponibilidad consultable por barbero, servicio y fecha.
- **FR-009**: El sistema MUST restringir la gestión de horarios y bloqueos al barbero propio o al administrador (403 para el resto).
- **FR-010**: La disponibilidad ofrecida a los clientes MUST coincidir exactamente con el resultado del motor de disponibilidad.

### Key Entities

- **HorarioLaboral**: bloques de día de la semana con hora de inicio y fin configurados por el barbero.
- **Bloqueo**: rango de fechas (con motivo) que resta disponibilidad puntualmente.
- **Feriado**: fecha de cierre global que resta disponibilidad a todos los barberos.
- **Barbero**: dueño de la configuración de horarios y bloqueos.
- **Turno**: consume disponibilidad al estar ocupado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las franjas ofrecidas combina horario, turnos, bloqueos y feriados sin inconsistencias.
- **SC-002**: Configurar horarios altera la disponibilidad pública en la siguiente consulta (CU-03).
- **SC-003**: Crear/eliminar un bloqueo se refleja inmediatamente en la disponibilidad.
- **SC-004**: El 100% de los bloqueos que solapan turnos confirmados es advertido con 409 antes de guardar.
- **SC-005**: El 100% de los horarios inválidos y días fuera de rango es rechazado.
- **SC-006**: Un feriado global elimina la disponibilidad de todos los barberos en esa fecha.
- **SC-007**: La disponibilidad de CU-03 coincide exactamente con el resultado del motor (0 divergencias).
- **SC-008**: Cada endpoint tiene al menos un test del caso feliz y un caso de error.

## Assumptions

- Alcance: generar disponibilidad, crear/editar bloqueos y excepciones.
- Fuera de alcance: plantillas de turnos recurrentes complejas e integración con festivos externos.
- Existen identidades con rol barbero/admin (ver 001-registro-passkeys) y turnos (ver 003-reserva-turnos).
- El motor de disponibilidad se centraliza para evitar divergencias de cálculo y zona horaria.
- La persistencia está disponible (ver 000-arquitectura).
