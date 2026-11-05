# Feature Specification: Año del pie de página sin actualización diferida

**Feature Branch**: `013-footer-anio`

**Created**: 2026-10-26

**Status**: Implemented

**Verification**: lint y typecheck sin errores; build completado en copia aislada con Turbopack (el intento dentro del repositorio no completó con el servidor de desarrollo activo); HTML verificado por HTTP.

**Input**: User description: "Corregir el error de ESLint del pie de página sin cambiar su comportamiento visible, mediante un ciclo SDD pequeño y verificable."

## Problem Statement

El pie de página muestra el año calendario actual, pero lo obtiene mediante una actualización de estado ejecutada inmediatamente después del montaje. Esa actualización provoca un render adicional innecesario y hace fallar la validación de lint del frontend. El año es un dato determinable durante el renderizado y no requiere un ciclo de vida posterior.

## Scope

### In Scope

- El pie de página de la aplicación.
- Mostrar el año calendario actual con el mismo texto y los mismos enlaces.
- Eliminar la causa del error de lint sin afectar otras vistas.

### Out of Scope

- Otros errores o advertencias de lint.
- Cambios visuales, de contenido o de navegación.
- Backend, base de datos, autenticación, servicios externos y dependencias.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Año visible y correcto (Priority: P1)

Un visitante ve el año calendario actual en el pie de página, junto con el aviso de derechos reservados y los enlaces existentes.

**Why this priority**: Es el comportamiento visible que debe preservarse.

**Independent Test**: Se renderiza la aplicación y se verifica que el pie muestra el año actual y los tres enlaces de navegación sin cambios.

**Acceptance Scenarios**:

1. **Given** una fecha dentro del año calendario actual, **When** se renderiza el pie, **Then** el año mostrado coincide con el año actual.
2. **Given** el pie renderizado, **When** se inspecciona su contenido, **Then** conserva el aviso de derechos reservados y los enlaces a servicios, reserva y mis turnos.

---

### User Story 2 - Validación del frontend sin errores (Priority: P1)

Un desarrollador ejecuta la validación de lint del frontend y no obtiene errores.

**Why this priority**: Es la razón del cambio y el criterio objetivo de aceptación.

**Independent Test**: Se ejecuta el lint del frontend y se verifica que termina sin errores.

**Acceptance Scenarios**:

1. **Given** el código corregido, **When** se ejecuta el lint del frontend, **Then** no se reporta el error del pie de página.
2. **Given** el código corregido, **When** se ejecuta el typecheck, **Then** no aparecen errores de TypeScript.

---

### Edge Cases

- El año local del servidor y el del navegador difieren en el cambio de año: el HTML inicial puede mostrar un año de respaldo y el cliente lo corrige durante la hidratación.
- El pie no tiene interacción propia: los enlaces deben seguir funcionando sin depender de estado local.
- El proceso de build prerenderiza el pie con el snapshot de respaldo; el año definitivo se resuelve en el cliente tras la hidratación.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El pie MUST mostrar el año calendario actual.
- **FR-002**: El pie MUST conservar el texto de derechos reservados y los enlaces existentes.
- **FR-003**: El pie MUST obtener el año sin una actualización de estado síncrona dentro de un efecto.
- **FR-004**: El cambio MUST limitarse al pie de página y no introducir dependencias nuevas.
- **FR-005**: La validación de lint del frontend MUST finalizar sin errores.

### Key Entities

No aplica: la feature no incorpora entidades ni persistencia.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El lint del frontend finaliza con código de salida 0 y sin el error `react-hooks/set-state-in-effect` en el pie.
- **SC-002**: El typecheck del frontend finaliza sin errores.
- **SC-003**: El build de producción del frontend finaliza correctamente; si el servidor de desarrollo comparte `.next`, se valida en una copia aislada y la limitación se registra.
- **SC-004**: El pie conserva el año actual y los tres enlaces visibles.
- **SC-005**: No se modifica ningún archivo fuera del alcance declarado, salvo documentación SDD.

## Assumptions

- El año se determina con la fecha local del navegador después de la hidratación.
- El HTML inicial puede usar un año de respaldo; no se requiere que coincida con el año del cliente antes de la hidratación.
- No se requiere actualización automática del año sin un nuevo renderizado.
- Las tres advertencias de lint existentes en otros archivos quedan fuera del alcance y no bloquean esta feature.
- La aplicación no tiene un test de componentes configurado; la verificación se apoya en lint, typecheck y build.
