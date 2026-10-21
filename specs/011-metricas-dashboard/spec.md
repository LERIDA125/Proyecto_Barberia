# Feature Specification: Dashboard de Métricas de Negocio

**Feature Branch**: `011-metricas-dashboard`

**Created**: 2026-10-20

**Status**: Implemented

**Input**: User description: "Feature de métricas de negocio (dashboard): darle al administrador una vista de métricas en un rango de fechas configurable — ingreso generado, ocupación de la agenda y servicios más pedidos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Métricas globales del negocio (Priority: P1)

Un administrador ve, para un rango de fechas elegido, el ingreso generado, la ocupación de la agenda y los servicios más pedidos.

**Why this priority**: Es el valor principal de la feature: dar visibilidad de negocio al administrador.

**Independent Test**: Se puede probar seleccionando un rango con actividad y verificando que ingresos, ocupación y servicios más pedidos se muestran coherentes con los turnos del período.

**Acceptance Scenarios**:

1. **Given** un administrador con actividad en el rango, **When** consulta el dashboard con un rango de fechas, **Then** ve ingresos, ocupación y servicios más pedidos del período.
2. **Given** un rango sin actividad, **When** el administrador lo consulta, **Then** ve todos los valores en cero y una lista de servicios vacía, sin errores.

---

### User Story 2 - Acceso restringido a administración (Priority: P1)

Solo el administrador accede al dashboard; barbero y cliente reciben un rechazo de permisos.

**Why this priority**: Las métricas de negocio son información sensible de gestión.

**Independent Test**: Se puede probar accediendo con un rol no-admin y verificando el rechazo (403) tanto en la API como en la UI.

**Acceptance Scenarios**:

1. **Given** un rol barbero o cliente, **When** intenta acceder al dashboard, **Then** recibe un rechazo de permisos (403).
2. **Given** un usuario sin sesión, **When** intenta acceder, **Then** es redirigido al login.

---

### Edge Cases

- ¿Qué pasa cuando no hay capacidad disponible en el rango? → la ocupación es 0 sin dividir por cero.
- ¿Qué pasa si `desde > hasta`? → rechazo (400).
- ¿Qué pasa con turnos cancelados? → no cuentan como ingreso ni como ocupación.
- ¿Qué pasa con un rango vacío? → todo en cero y lista de servicios vacía, sin errores.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST exponer métricas globales del negocio en un rango de fechas configurable (`desde`, `hasta`).
- **FR-002**: El sistema MUST calcular el ingreso contabilizando únicamente los turnos completados.
- **FR-003**: El sistema MUST calcular la ocupación de la agenda a partir de los turnos vigentes y de las horas laborables de los barberos activos, sin dividir por cero.
- **FR-004**: El sistema MUST listar los servicios más pedidos, ordenados por cantidad y sin contar turnos cancelados.
- **FR-005**: El sistema MUST contar los turnos por estado dentro del rango.
- **FR-006**: El sistema MUST rechazar rangos inválidos (`desde > hasta`) con error explícito.
- **FR-007**: El sistema MUST restringir el acceso al dashboard al rol administrador (403 para el resto).
- **FR-008**: El dashboard MUST mostrar estados de carga, error, vacío y permitir reintentar.
- **FR-009**: El sistema MUST aplicar valores por defecto cuando `desde`/`hasta` no se especifican (el día actual).
- **FR-010**: El sistema MUST tratar el extremo `hasta` de forma inclusiva hasta el final del día.

### Key Entities

- **Turno**: fuente de todos los cálculos; atributos relevantes: estado, fecha de inicio, fecha de fin, servicio y precio.
- **Servicio**: insumo del ranking de más pedidos; atributos relevantes: nombre y precio.
- **Barbero**: insumo del cálculo de horas disponibles; atributos relevantes: estado activo, horario y días laborales.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un administrador ve métricas del negocio en el rango elegido; barbero y cliente reciben 403.
- **SC-002**: El ingreso contabiliza exclusivamente turnos completados (0 turnos no completados sumados).
- **SC-003**: La ocupación nunca divide por cero (resultado 0 cuando no hay capacidad).
- **SC-004**: Un rango vacío devuelve lista de servicios vacía y todos los valores en cero sin errores.
- **SC-005**: El ranking de servicios más pedidos respeta el orden por cantidad (con desempate alfabético) y excluye cancelados.
- **SC-006**: Verificación técnica: `node --check` (backend), `npx tsc --noEmit` y `npx eslint` sobre archivos frontend modificados.

## Assumptions

- Alcance: dashboard de métricas admin-only en `/panel/metricas`.
- Fuera de alcance: modificar el endpoint existente `GET /api/barberos/me/metricas` (cuenta por estado de un barbero).
- Existen turnos y servicios (ver 002-catalogo-servicios, 003-reserva-turnos, 004-gestion-turnos-cliente) y barberos (ver 005-panel-barberos).
- La semántica del rango de fechas es consistente con la ya usada por los servicios existentes.
- El frontend usa el patrón de hooks y estilos del panel existente.
