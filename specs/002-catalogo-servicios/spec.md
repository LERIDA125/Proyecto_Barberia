# Feature Specification: Catálogo de Servicios

**Feature Branch**: `002-catalogo-servicios`

**Created**: 2026-10-20

**Status**: Implemented

**Input**: User description: "CU-02 — Administración del catálogo de servicios (nombre, descripción, duración y precio) y su consulta pública antes de reservar."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consulta pública del catálogo (Priority: P1)

Un visitante o cliente ve los servicios activos de la barbería con su nombre, duración y precio, para conocer la oferta antes de reservar.

**Why this priority**: El catálogo público es el insumo de la reserva (CU-03) y la información mínima que necesita un cliente.

**Independent Test**: Se puede probar abriendo la vista de catálogo sin sesión y verificando que se listan los servicios activos con nombre, duración y precio.

**Acceptance Scenarios**:

1. **Given** existen servicios activos, **When** un visitante abre el catálogo, **Then** ve todos los servicios activos con nombre, duración y precio.
2. **Given** no hay servicios activos, **When** un visitante abre el catálogo, **Then** ve un estado vacío comprensible.

---

### User Story 2 - Gestión del catálogo por administración (Priority: P2)

Un administrador crea, edita y desactiva servicios; los cambios se reflejan en el catálogo público sin afectar turnos existentes.

**Why this priority**: La gestión es necesaria para mantener el catálogo real, pero la consulta pública ya entrega valor con datos precargados.

**Independent Test**: Se puede probar creando un servicio como admin y verificando que aparece de inmediato en el catálogo; luego desactivarlo y verificar que desaparece del público pero el historial se conserva.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** crea un servicio válido, **Then** aparece inmediatamente en el catálogo público.
2. **Given** un servicio creado, **When** el administrador lo edita, **Then** sus datos se actualizan sin afectar los turnos ya existentes.
3. **Given** un servicio referenciado por turnos, **When** el administrador lo desactiva, **Then** se oculta del catálogo público pero el historial de turnos se conserva.
4. **Given** un usuario sin rol admin, **When** intenta operaciones de escritura, **Then** recibe un error de permisos (403).

---

### Edge Cases

- ¿Qué pasa con nombre vacío, duración ≤ 0 o precio negativo? → rechazo en UI y API.
- ¿Qué pasa al duplicar el nombre de un servicio? → rechazo con conflicto (409).
- ¿Qué pasa al desactivar un servicio con turnos futuros referenciados? → se conserva el historial (borrado lógico); el catálogo público lo oculta.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST exponer un listado público de los servicios activos con nombre, descripción, duración y precio.
- **FR-002**: El sistema MUST permitir al administrador crear un servicio con nombre, descripción, duración y precio.
- **FR-003**: El sistema MUST permitir al administrador editar los campos de un servicio existente.
- **FR-004**: El sistema MUST permitir al administrador desactivar un servicio (borrado lógico), ocultándolo del catálogo público sin borrar su historial.
- **FR-005**: El sistema MUST validar que `nombre` no esté vacío y sea único, `duracionMin > 0` y `precio >= 0`, tanto en UI como en API.
- **FR-006**: El sistema MUST rechazar nombres duplicados de servicio con respuesta de conflicto (409).
- **FR-007**: El sistema MUST restringir las operaciones de escritura a usuarios con rol administrador (403 para el resto).
- **FR-008**: Editar un servicio MUST preservar los turnos ya existentes que lo referencian.
- **FR-009**: El administrador MAY listar también los servicios inactivos mediante un parámetro explícito.

### Key Entities

- **Servicio**: prestación ofrecida por la barbería; atributos: nombre (único), descripción, duración estimada en minutos, precio, estado activo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visitante ve el 100% de los servicios activos con nombre, duración y precio sin autenticarse.
- **SC-002**: Un servicio creado por un administrador es visible en el catálogo público sin recargar datos de otra fuente (consistencia inmediata).
- **SC-003**: El 100% de las escrituras con datos inválidos (nombre vacío, duración ≤ 0, precio < 0) son rechazadas tanto en UI como en API.
- **SC-004**: Ningún request de escritura sin rol admin es aceptado (0% de escape de permisos en revisión de endpoints).
- **SC-005**: Desactivar un servicio reduce el catálogo público en exactamente ese ítem y cero turnos históricos se ven afectados.
- **SC-006**: Cada endpoint tiene al menos un test del caso feliz y un caso de error.

## Assumptions

- Alcance: CRUD de servicios y listado público.
- Fuera de alcance: promociones, combos, impuestos.
- La identidad de administrador ya existe (ver 001-registro-passkeys).
- Los servicios son seleccionables al reservar (dependencia con 003-reserva-turnos).
- La persistencia está disponible (ver 000-arquitectura).
