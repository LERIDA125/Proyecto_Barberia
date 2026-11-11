# Feature Specification: Login clásico con email y contraseña (contingencia de presentación)

**Feature Branch**: `017-login-clasico-contingencia`

**Created**: 2026-11-10

**Status**: Implemented

**Input**: User description: "Necesitamos agregar un sistema de login tradicional (Email y Contraseña) como plan de contingencia para la presentación, ya que el profe podría tener problemas con las Passkeys."

## Problem Statement

El único flujo de acceso a la aplicación es el login con passkeys (WebAuthn), que depende del navegador, el dispositivo y las condiciones del entorno donde se presente. Si la passkey falla durante la demo (dispositivo sin soporte, navegador sin WebAuthn disponible, permisos bloqueados), no existe un camino de acceso alternativo y la aplicación queda inaccesible.

## Scope

### In Scope

- El seed guarda una contraseña de demo por rol para **todos los usuarios sembrados** (admin, 2 barberos, 2 clientes), hasheada con bcrypt en el campo ya existente `password_hash`.
- Un endpoint de login tradicional que recibe email y contraseña, los valida contra el hash almacenado y emite la misma cookie de sesión firmada que el login con passkey.
- Un formulario clásico (email + contraseña) con el botón "Ingresar (Clásico)" en la pantalla de login, debajo del flujo existente con passkey.
- Pruebas automatizadas del nuevo service y verificación de que el flujo con passkey no cambia.

### Out of Scope

- Registro de usuarios con contraseña desde la UI (solo los usuarios del seed reciben una; los demás siguen solo con passkey).
- Recuperación/cambio de contraseña, MFA adicional o rate limiting del login.
- Modificar el esquema Prisma o las migraciones (`password_hash` ya existe, nullable).
- Ejecutar el seed contra la base de producción (decisión operativa manual del equipo).
- Cambios en el flujo de passkeys, el bypass de desarrollo de 016 o la sesión existente.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ingresar con email y contraseña (Priority: P1)

Quien presenta necesita poder entrar a la aplicación con el email y la contraseña de cualquier usuario sembrado (admin, barbero o cliente), sin usar WebAuthn, como respaldo ante cualquier problema con passkeys.

**Why this priority**: sin un camino alternativo, un fallo de passkey en la presentación deja la aplicación completa inaccesible.

**Independent Test**: Enviar email y contraseña válidos de cada rol al endpoint de login y verificar que responde con el usuario y emite la cookie de sesión; usar esa cookie contra el endpoint de sesión y obtener el usuario correspondiente.

**Acceptance Scenarios**:

1. **Given** un usuario sembrado con la contraseña de su rol, **When** se envían email y contraseña correctos, **Then** se emite la cookie de sesión firmada y se devuelve el usuario serializado, sin exponer el hash.
2. **Given** la cookie emitida, **When** se consulta la sesión, **Then** se obtiene el usuario autenticado (misma sesión que el login con passkey).
3. **Given** una contraseña incorrecta, **When** se envía al endpoint, **Then** se rechaza con 401 y un mensaje uniforme.
4. **Given** un email inexistente, **When** se envía cualquier contraseña, **Then** se rechaza con el mismo 401 y mensaje del caso anterior (no se revela la existencia del email).
5. **Given** un body sin contraseña, **When** se envía, **Then** se rechaza con 400 por validación.

### User Story 2 - El flujo con passkey no cambia (Priority: P1)

El equipo necesita que el login clásico sea un agregado, no un reemplazo: el acceso con passkey sigue funcionando exactamente igual.

**Why this priority**: las passkeys siguen siendo el mecanismo principal de la aplicación.

**Independent Test**: Ejecutar la suite automatizada de auth y verificar que los tests del flujo con passkey siguen en verde sin cambios.

**Acceptance Scenarios**:

1. **Given** la pantalla de login, **When** se accede con passkey, **Then** el flujo existente (email → botón "Entrar con passkey") se mantiene sin cambios de contrato.
2. **Given** el navegador sin soporte WebAuthn, **When** se carga la pantalla de login, **Then** el formulario clásico sigue disponible como camino de acceso.
3. **Given** la suite de tests de backend, **When** se ejecuta, **Then** los tests de `verificarLogin` (passkey) y bypass de desarrollo pasan sin modificaciones.

### Edge Cases

- **Usuario sin `password_hash`** (usuarios registrados por UI, que solo tienen passkey): el login clásico MUST responder con el mismo 401 uniforme, sin revelar que el usuario existe pero no tiene contraseña.
- **Contraseña vacía o body incompleto**: rechazo 400 por validación antes de consultar la base.
- **Email con mayúsculas o espacios**: se normaliza (trim + lowercase) igual que en el resto de los flujos de auth.
- **Usuario inactivo**: se mantiene el comportamiento actual del login con passkey; esta feature no altera la política de cuentas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El seed MUST almacenar en `password_hash` de cada usuario sembrado (admin, 2 barberos, 2 clientes) el hash bcrypt de la contraseña de demo de su rol — `admin123`, `barbero123`, `cliente123` — con costo estándar (10 rounds).
- **FR-002**: El sistema MUST exponer un endpoint de login tradicional que reciba `email` y `password`, valide el formato y verifique la contraseña contra el hash almacenado con bcrypt.
- **FR-003**: El login clásico exitoso MUST emitir exactamente la misma cookie de sesión firmada que emite el login con passkey (misma utilidad, misma duración).
- **FR-004**: El login clásico MUST responder con un 401 de mensaje uniforme ante contraseña incorrecta, usuario inexistente o usuario sin contraseña registrada.
- **FR-005**: La respuesta exitosa MUST devolver el usuario serializado sin exponer `password_hash` ni datos de credenciales.
- **FR-006**: La pantalla de login MUST ofrecer el formulario clásico (email + contraseña) con el botón "Ingresar (Clásico)", separado visualmente del flujo con passkey y sin depender del soporte WebAuthn del navegador.
- **FR-007**: La feature MUST NOT modificar el esquema Prisma, las migraciones, el contrato del login con passkey ni el bypass de desarrollo de 016.

### Key Entities

- **Usuario**: cuenta con email único y, opcionalmente, `password_hash` (bcrypt).
- **Sesión**: cookie firmada que identifica al usuario autenticado (compartida con el flujo passkey).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tras ejecutar el seed, los 5 usuarios sembrados tienen `password_hash` no nulo y verificable con bcrypt con la contraseña de su rol.
- **SC-002**: El 100% de los intentos de login clásico con credenciales correctas obtiene cookie de sesión válida y usuario serializado.
- **SC-003**: El 100% de los intentos con credenciales incorrectas, email inexistente o usuario sin contraseña recibe 401 con mensaje uniforme.
- **SC-004**: La suite automatizada del backend pasa sin regresiones (tests de passkey y bypass intactos).

## Assumptions

- Todos los usuarios del seed reciben la contraseña de su rol (`admin123` / `barbero123` / `cliente123`); los usuarios registrados por UI siguen accediendo solo por passkey.
- Las contraseñas son de demo elegidas explícitamente para la presentación, no secretos del sistema.
- La elección de bcryptjs (JS puro) sobre bcrypt (nativo) responde a portabilidad: sin binarios nativos en Windows ni en el deploy de Vercel Services.
- La aplicación de las contraseñas en la base de producción requiere ejecutar el seed ahí (decisión operativa manual).

## Dependencies

- Feature 001 (registro/login con passkeys): sesión por cookie firmada y serializers de usuario.
- Feature 016 (seed y bypass de desarrollo): seed destructivo existente sobre el que se agrega el hash.

## Traceability

- Plan técnico: [`plan.md`](./plan.md)
- Tareas: [`tasks.md`](./tasks.md)
- Índice de specs: [`../index.md`](../index.md)
