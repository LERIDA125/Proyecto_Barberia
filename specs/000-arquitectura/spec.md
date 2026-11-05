# Feature Specification: Arquitectura del Sistema de Barbería

**Feature Branch**: `000-arquitectura`

**Created**: 2026-10-20

**Status**: Implemented

**Input**: User description: "Arquitectura maestra del Sistema Integral de Gestión y Reservas para Barbería: capas, modelo de datos, estructura del repositorio y decisiones de arquitectura."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Operar la barbería de punta a punta (Priority: P1)

Un cliente reserva un turno, un barbero lo atiende y lo marca como completado, y el administrador consulta métricas del negocio. El sistema integra agenda, clientes, servicios, barberos y métricas en una sola aplicación web.

**Why this priority**: Es la capacidad de negocio que justifica todo el sistema; sin ella no hay producto.

**Independent Test**: Se puede probar de punta a punta registrando un cliente, reservando un turno, completándolo como barbero y verificando que las métricas del administrador reflejan esa actividad.

**Acceptance Scenarios**:

1. **Given** un cliente registrado, **When** reserva un turno de un servicio con un barbero, **Then** el turno queda confirmado y visible en la agenda correspondiente.
2. **Given** un turno confirmado, **When** el barbero lo marca como completado, **Then** el estado se actualiza y el historial del cliente lo refleja.
3. **Given** actividad registrada, **When** el administrador consulta métricas, **Then** ve ingresos, ocupación y servicios más pedidos del período.

---

### User Story 2 - Interactuar con el asistente conversacional (Priority: P2)

Un cliente consulta información y realiza reservas conversando con un asistente que entiende lenguaje natural y ejecuta acciones a través de las mismas reglas de negocio del sistema.

**Why this priority**: Es un diferenciador de producto que amplía el canal de acceso, apoyado en las capacidades base ya operativas.

**Independent Test**: Se puede probar preguntando por servicios y solicitando una reserva por chat, verificando que la reserva queda con la misma validación que la UI.

**Acceptance Scenarios**:

1. **Given** un cliente autenticado, **When** consulta servicios por chat, **Then** recibe información real del local.
2. **Given** una solicitud de reserva por chat con confirmación explícita, **When** el asistente la ejecuta, **Then** el turno se crea con las mismas validaciones de negocio que la API.

---

### User Story 3 - Sincronizar con la agenda externa (Priority: P3)

Los turnos se reflejan en una agenda externa (Google Calendar), de modo que el personal use el calendario que ya conoce sin perder consistencia con el sistema.

**Why this priority**: Agrega conveniencia operativa, pero es prescindible para operar la barbería (parcial en el estado actual).

**Independent Test**: Se puede probar confirmando un turno y verificando la creación del evento externo y su identificador en el turno; y reprogramando/cancelando para verificar la consistencia.

**Acceptance Scenarios**:

1. **Given** un turno confirmado y la integración activa, **When** se sincroniza, **Then** se crea el evento externo y se guarda su identificador.
2. **Given** la integración no disponible, **When** se confirma un turno, **Then** el turno se persiste y queda pendiente de sincronización.

---

### Edge Cases

- ¿Qué pasa si la UI accede a datos sin pasar por la API? → prohibido por el principio de separación de capas.
- ¿Qué pasa si un módulo fuera de la integración habla directamente con la base de datos o Google? → prohibido por el principio de encapsulamiento.
- ¿Qué pasa si el chatbot intenta ejecutar una acción con reglas propias? → prohibido: reutiliza los mismos servicios que la API.
- ¿Qué pasa si el servicio de datos externo cambia? → la fuente debe ser intercambiable gracias al desacoplamiento.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST separar la interfaz de presentación de la lógica de negocio y del acceso a datos: la UI nunca accede a la base de datos directamente.
- **FR-002**: El sistema MUST exponer sus capacidades de negocio a través de una API consumida por la interfaz y por el asistente.
- **FR-003**: El asistente conversacional MUST reutilizar los mismos servicios de negocio que la API, sin duplicar reglas.
- **FR-004**: El sistema MUST acceder a la persistencia y a la agenda externa de forma desacoplada, de modo que la fuente de datos sea intercambiable.
- **FR-005**: El sistema MUST persistir las entidades de negocio: usuarios, barberos, servicios, turnos y credenciales de acceso.
- **FR-006**: El sistema MUST garantizar la integridad de la agenda: sin solapamiento de turnos por barbero y con duración derivada del servicio.
- **FR-007**: El sistema MUST preservar el historial mediante borrado lógico en lugar de borrado físico de entidades referenciadas.
- **FR-008**: El sistema MUST mantener la identidad de cada actor (cliente, barbero, administrador) y sus permisos correspondientes.
- **FR-009**: El sistema MUST registrar la relación de un turno con su evento en la agenda externa cuando la integración esté activa.

### Key Entities

- **Usuario**: persona que accede al sistema; atributos: nombre, email (único), teléfono, rol, estado activo.
- **Barbero**: profesional que atiende turnos; atributos: especialidad, horario, días laborales, estado activo; se vincula a un usuario.
- **Servicio**: prestación ofrecida; atributos: nombre, descripción, duración en minutos, precio, estado activo.
- **Turno**: reserva de un servicio con un barbero en una fecha/hora; atributos: cliente, barbero, servicio, inicio, fin, estado, notas, vínculo con el evento externo.
- **CredencialPasskey**: credencial de acceso asociada a un usuario.
- **HorarioLaboral, Bloqueo y Feriado**: reglas que definen disponibilidad (ver 008-gestion-disponibilidad).
- **Notificacion y PreferenciaNotificacion**: avisos y configuración del usuario (ver 010-notificaciones-estado).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un flujo completo de negocio (registro → reserva → atención → métricas) es operable de punta a punta.
- **SC-002**: La UI no realiza acceso directo a datos: el 100% de las operaciones pasa por la API.
- **SC-003**: El asistente produce las mismas validaciones de negocio que la API (0 divergencias en reservas por chat vs. UI).
- **SC-004**: La agenda mantiene 0 solapamientos por barbero.
- **SC-005**: El historial de turnos se conserva aunque se desactiven servicios o barberos (borrado lógico).
- **SC-006**: La integración con la agenda externa puede fallar sin bloquear la operación (turno persistido y pendiente).

## Assumptions

- Alcance: diseño técnico y organizativo del sistema; este feature describe el "qué" y su "cómo" vive en `plan.md`.
- Fuera de alcance: implementación de código.
- El stack y sus versiones se detallan en `plan.md` (Next.js + Tailwind, Node.js, LangChain, MCP, PostgreSQL, Google Calendar).
- Las features 001–012 son los casos de uso y capacidades que esta arquitectura habilita.
