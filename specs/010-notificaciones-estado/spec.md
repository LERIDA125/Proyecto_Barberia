# Feature Specification: Notificaciones de Estado de Turno

**Feature Branch**: `010-notificaciones-estado`

**Created**: 2026-10-20

**Status**: Partial — notificaciones in-app implementadas; preferencias, recordatorios y email pendientes. Ver `ESTADO.md` y `tasks.md`.

**Input**: User description: "CU-10 — Notificaciones y recordatorios: notificar a los actores cuando cambia el estado de un turno y enviar recordatorios previos a la cita, de forma interna y por email."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Notificaciones por cambio de estado (Priority: P1)

Cuando un turno se confirma, reprograma o cancela, el cliente y el barbero reciben una notificación interna; la UI muestra un contador de no leídas.

**Why this priority**: Mantener informados a los actores evita ausencias y confusiones; es el núcleo del caso de uso.

**Independent Test**: Se puede probar confirmando un turno y verificando que se genera una notificación para cliente y barbero y que el contador de no leídas se actualiza.

**Acceptance Scenarios**:

1. **Given** un turno que cambia de estado (confirmado, reprogramado, cancelado), **When** se produce el cambio, **Then** se genera una notificación para el cliente y el barbero.
2. **Given** notificaciones no leídas, **When** el usuario las consulta, **Then** la UI muestra un contador que se actualiza al marcarlas como leídas.

---

### User Story 2 - Marcado como leídas y propiedad (Priority: P1)

Un usuario marca una o todas sus notificaciones como leídas, y no puede leer ni modificar las de otro usuario.

**Why this priority**: El control de propiedad y la gestión del estado "leído" son requisitos de seguridad y usabilidad básicos.

**Independent Test**: Se puede probar marcando una notificación propia como leída y verificando el rechazo al intentar operar sobre una ajena.

**Acceptance Scenarios**:

1. **Given** una notificación no leída propia, **When** el usuario la marca como leída, **Then** su estado cambia y el contador disminuye.
2. **Given** notificaciones propias, **When** el usuario marca todas como leídas, **Then** el contador queda en cero.
3. **Given** una notificación de otro usuario, **When** se intenta leer o modificar, **Then** recibe error de permisos (403).

---

### User Story 3 - Recordatorios y preferencias (Priority: P2)

El sistema envía un recordatorio al cliente antes de su turno según sus preferencias, y el usuario puede activar/desactivar el email y los recordatorios.

**Why this priority**: Aumenta la asistencia, pero depende de las notificaciones base y de la configuración de preferencias.

**Independent Test**: Se puede probar configurando preferencias con recordatorio activo y verificando que se dispara el envío antes del turno.

**Acceptance Scenarios**:

1. **Given** un turno próximo y un cliente con recordatorios activos, **When** llega el momento configurado, **Then** el sistema envía un recordatorio.
2. **Given** un usuario autenticado, **When** activa/desactiva el email o los recordatorios, **Then** sus preferencias se persisten.
3. **Given** un fallo del proveedor de email, **When** ocurre, **Then** la notificación interna se conserva y el error se registra sin romper el flujo.

---

### Edge Cases

- ¿Qué pasa si el envío de email falla? → la notificación interna se conserva; el error se registra sin romper el flujo.
- ¿Qué pasa ante envíos duplicados? → idempotencia por turno y tipo de evento.
- ¿Qué pasa con recordatorios en zonas horarias distintas? → usar timestamps absolutos y zona horaria del sistema.
- Privacidad: no incluir datos sensibles en el cuerpo del email.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST generar una notificación para cliente y barbero al confirmar, reprogramar o cancelar un turno.
- **FR-002**: La UI MUST mostrar un contador de notificaciones no leídas que se actualiza al marcarlas.
- **FR-003**: El usuario MUST poder marcar una notificación como leída.
- **FR-004**: El usuario MUST poder marcar todas sus notificaciones como leídas.
- **FR-005**: El sistema MUST impedir que un usuario lea o modifique notificaciones de otro (403).
- **FR-006**: El sistema MUST enviar un recordatorio al cliente `horasAntes` antes del turno según sus preferencias.
- **FR-007**: El usuario MUST poder activar/desactivar las notificaciones por email y los recordatorios.
- **FR-008**: El sistema MUST conservar la notificación interna y registrar el error si el envío de email falla, sin romper el flujo.
- **FR-009**: El sistema MUST exponer y persistir las preferencias de notificación del usuario.
- **FR-010**: El sistema MUST evitar el envío duplicado de notificaciones (idempotencia por turno y tipo de evento).
- **FR-011**: El administrador o el sistema MUST poder disparar el envío de recordatorios pendientes.

### Key Entities

- **Notificacion**: aviso generado por un cambio de estado o recordatorio; atributos: tipo, mensaje, turno asociado, estado de lectura, fecha de creación.
- **PreferenciaNotificacion**: configuración del usuario; atributos: email activo, recordatorios activos, horas de anticipación.
- **Turno**: origen de los eventos que generan notificaciones.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los cambios de estado (confirmado, reprogramado, cancelado) genera notificación para cliente y barbero.
- **SC-002**: El contador de no leídas coincide con las notificaciones pendientes en todo momento.
- **SC-003**: Marcar como leída o todas como leídas actualiza el contador correctamente en el 100% de los casos.
- **SC-004**: El 100% de los accesos a notificaciones ajenas es rechazado con 403.
- **SC-005**: El recordatorio se envía al cliente `horasAntes` antes del turno según sus preferencias.
- **SC-006**: Ante fallo del proveedor de email, la notificación interna se conserva y el error se registra (0 pérdidas de notificación).
- **SC-007**: 0 notificaciones duplicadas para el mismo turno y tipo de evento.
- **SC-008**: Cada endpoint tiene al menos un test del caso feliz y un caso de error.

## Assumptions

- Alcance: generación, listado y marcado como leídas; recordatorio previo.
- Fuera de alcance: SMS/WhatsApp (futuro) y plantillas personalizables avanzadas.
- Existen turnos y cambios de estado (ver 003-reserva-turnos, 004-gestion-turnos-cliente).
- Requiere nuevas entidades de dominio: **Notificacion y PreferenciaNotificacion** (escalar al modelo maestro en `specs/000-arquitectura/plan.md`).
- Proveedor de email a definir por el Tech Lead; se dispone de un mecanismo de job para recordatorios.
