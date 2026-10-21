# Feature Specification: Vista de Clientes

**Feature Branch**: `012-vista-clientes`

**Created**: 2026-10-20

**Status**: Implemented

**Input**: User description: "Feature de vista de clientes: que el panel liste todos los clientes sin obligar a buscar, permita filtrar y ordenar en el cliente, y muestre el valor de cada cliente (tráfico y gasto acumulado) en su ficha."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Listado completo de clientes (Priority: P1)

Un barbero o administrador ve la lista completa de clientes al abrir la vista, sin tener que escribir una búsqueda previa.

**Why this priority**: Es el valor central de la feature: visibilidad inmediata de la cartera de clientes.

**Independent Test**: Se puede probar abriendo la vista de clientes como staff y verificando que la lista carga completa sin búsqueda previa.

**Acceptance Scenarios**:

1. **Given** un barbero/admin autenticado, **When** abre la vista de clientes, **Then** ve la lista completa de clientes sin búsqueda previa.
2. **Given** un cliente autenticado, **When** intenta acceder a la vista, **Then** recibe un rechazo de permisos (403).

---

### User Story 2 - Filtrar y ordenar en el cliente (Priority: P2)

El staff filtra en vivo por nombre o email y ordena la lista por nombre o por más turnos, sin recargar la página.

**Why this priority**: Mejora la usabilidad sobre el listado base, que ya entrega valor por sí solo.

**Independent Test**: Se puede probar escribiendo un filtro y cambiando el orden, verificando que ambos se aplican en el cliente sin recargar.

**Acceptance Scenarios**:

1. **Given** la lista cargada, **When** el staff escribe un filtro, **Then** la lista se filtra en vivo (case-insensitive) por nombre y email.
2. **Given** la lista cargada, **When** el staff cambia el orden, **Then** la lista se ordena por nombre o por más turnos sin recargar.
3. **Given** un filtro sin coincidencias, **When** se aplica, **Then** se muestra un estado vacío distinto al de "no hay clientes".

---

### User Story 3 - Valor del cliente en su ficha (Priority: P2)

La ficha de cada cliente muestra su resumen de valor: total de turnos, completados, total gastado y última visita, visible aunque no haya turnos.

**Why this priority**: Aporta contexto de negocio para la atención, apoyado en el listado y la ficha existentes.

**Independent Test**: Se puede probar abriendo la ficha de un cliente con turnos y verificando los contadores; y la de un cliente sin completados, verificando que el total gastado es cero.

**Acceptance Scenarios**:

1. **Given** un cliente con turnos completados, **When** el staff abre su ficha, **Then** ve total de turnos, completados, total gastado y última visita.
2. **Given** un cliente sin turnos completados, **When** el staff abre su ficha, **Then** ve el encabezado con total gastado en cero, sin errores.

---

### Edge Cases

- ¿Qué pasa cuando no hay clientes? → estado vacío de "no hay clientes".
- ¿Qué pasa cuando el filtro no matchea? → estado vacío distinto al anterior.
- ¿Qué pasa si el parámetro de límite es inválido? → rechazo (400).
- La lista se limita a un máximo de clientes por carga; no se rompe la ficha ni el historial existentes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST listar todos los clientes sin requerir una búsqueda previa, con un límite configurable (por defecto 200, tope 500).
- **FR-002**: El sistema MUST rechazar límites inválidos con error explícito (400).
- **FR-003**: El sistema MUST restringir la vista de clientes a los roles barbero y administrador (403 para clientes).
- **FR-004**: La interfaz MUST permitir filtrar en vivo por nombre y email, de forma case-insensitive, sin mínimo de caracteres.
- **FR-005**: La interfaz MUST permitir ordenar la lista por nombre o por cantidad de turnos, en el cliente y sin recargar.
- **FR-006**: La interfaz MUST distinguir entre "sin clientes" y "filtro sin coincidencias" con estados vacíos diferenciados.
- **FR-007**: La ficha de un cliente MUST mostrar un resumen con total de turnos, completados, total gastado y última visita.
- **FR-008**: El resumen MUST calcularse sobre los turnos ya obtenidos para el cliente, sin consultas adicionales.
- **FR-009**: El total gastado MUST sumar solo los turnos completados y ser cero cuando no haya completados.
- **FR-010**: La lista MUST mostrar, por cliente, nombre, email y un indicador de cantidad de turnos.
- **FR-011**: Los cambios MUST NOT romper la ficha ni el historial existentes.

### Key Entities

- **Cliente**: persona atendida por la barbería; atributos: nombre, email, teléfono, estado activo, cantidad de turnos.
- **Turno**: fuente del resumen de valor; atributos relevantes: estado, fecha de inicio, servicio y precio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La lista de clientes carga completa sin requerir búsqueda previa.
- **SC-002**: Filtrar y ordenar funcionan en el cliente sin recargar la página.
- **SC-003**: La ficha muestra gasto total y última visita; el total gastado es 0 cuando no hay completados.
- **SC-004**: Barbero y admin acceden a la vista; el cliente recibe 403.
- **SC-005**: El listado no devuelve más del tope de clientes por carga (cap 500) ni rechaza un límite válido.
- **SC-006**: Verificación técnica: `node --check` (backend), `npx tsc --noEmit` y `npx eslint` sobre archivos frontend modificados.

## Assumptions

- Alcance: listado completo de clientes con filtro/orden client-side y resumen de valor en la ficha; roles barbero/admin.
- Fuera de alcance: edición masiva de clientes, exportaciones, fidelización.
- Existen clientes y turnos (ver 003-reserva-turnos, 009-historial-visitas).
- La ficha y el historial existentes se conservan; esta feature los extiende, no los reemplaza.
- El frontend usa el patrón de hooks y estilos del panel existente.
