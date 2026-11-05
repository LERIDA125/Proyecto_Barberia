# Feature Specification: Registro y Autenticación con Passkeys

**Feature Branch**: `001-registro-passkeys`

**Created**: 2026-10-20

**Status**: Implemented

**Input**: User description: "CU-01 — Gestión de identidad y acceso: registro y autenticación sin contraseña tradicional mediante passkeys (WebAuthn)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registro con passkey (Priority: P1)

Un visitante se crea una cuenta proporcionando nombre, email y una passkey vinculada a su dispositivo (huella, Face ID, PIN o llave de seguridad). Al finalizar el registro, queda autenticado en el sistema.

**Why this priority**: Sin cuenta no existe identidad en el sistema; es la puerta de entrada a todos los demás casos de uso (reserva, turnos, notificaciones).

**Independent Test**: Se puede probar de forma independiente creando una cuenta con una passkey de prueba y verificando que la sesión queda activa al finalizar, sin ninguna otra feature.

**Acceptance Scenarios**:

1. **Given** un visitante sin cuenta, **When** completa el registro con nombre, email y passkey, **Then** la cuenta queda creada y la sesión inicia automáticamente.
2. **Given** un visitante que intenta registrarse con un email ya existente, **When** completa el registro, **Then** el sistema rechaza la operación con un mensaje claro de email duplicado.

---

### User Story 2 - Inicio de sesión con passkey (Priority: P1)

Un usuario registrado ingresa al sistema con su passkey, sin escribir ninguna contraseña.

**Why this priority**: Es el retorno recurrente al sistema; sin login no hay acceso a turnos ni panel.

**Independent Test**: Se puede probar registrando una cuenta y luego cerrando sesión para iniciar nuevamente solo con la passkey.

**Acceptance Scenarios**:

1. **Given** un usuario registrado, **When** inicia sesión con su passkey, **Then** queda autenticado y accede a las áreas privadas.
2. **Given** un dispositivo o navegador sin soporte WebAuthn, **When** intenta iniciar sesión, **Then** la interfaz muestra un mensaje explicativo y no se rompe.

---

### User Story 3 - Sesión y cierre de sesión (Priority: P2)

El sistema mantiene la sesión del usuario, muestra quién está autenticado y permite cerrar sesión; las rutas privadas protegen el acceso.

**Why this priority**: La gestión de sesión es necesaria para la seguridad de las áreas privadas, pero es un complemento del registro/login.

**Independent Test**: Se puede probar accediendo a una ruta privada sin sesión (debe redirigir a login) y cerrando sesión (debe volver a redirigir).

**Acceptance Scenarios**:

1. **Given** un usuario sin sesión activa, **When** intenta acceder a una ruta privada, **Then** es redirigido al login.
2. **Given** un usuario autenticado, **When** cierra sesión, **Then** la sesión se invalida, la cookie se borra y las rutas privadas vuelven a redirigir al login.

---

### Edge Cases

- ¿Qué pasa cuando el navegador/dispositivo no soporta WebAuthn? → mensaje explicativo, sin rotura de UI.
- ¿Qué pasa cuando la verificación de la passkey falla (challenge expirado o aserción inválida)? → error `400` con mensaje claro.
- ¿Qué pasa cuando se intenta registrar un email ya registrado? → error `409` con mensaje claro.
- Soporte desigual de passkeys entre navegadores/dispositivos: degradar con mensaje, no bloquear silenciosamente.
- La API WebAuthn requiere HTTPS (o `localhost`); fuera de ese contexto el registro/login no es posible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir a un visitante crear una cuenta proporcionando nombre, email y una passkey (WebAuthn).
- **FR-002**: El sistema MUST verificar la respuesta WebAuthn antes de crear el usuario y su credencial.
- **FR-003**: El sistema MUST rechazar el registro de un email ya existente con un mensaje claro.
- **FR-004**: El sistema MUST permitir iniciar sesión con una passkey para un usuario existente, sin contraseña.
- **FR-005**: El sistema MUST mantener una sesión autenticada y exponer el usuario actual a las áreas privadas.
- **FR-006**: El sistema MUST permitir cerrar sesión invalidando la sesión y la cookie asociada.
- **FR-007**: Toda ruta privada MUST redirigir al login cuando no hay sesión activa.
- **FR-008**: El sistema MUST mostrar un mensaje explicativo (y no romper la UI) cuando el dispositivo/navegador no soporta WebAuthn.
- **FR-009**: El sistema MUST impedir que credenciales y datos sensibles se registren en logs o se expongan al cliente.
- **FR-010**: Un usuario MAY tener varias passkeys (un dispositivo por credencial).
- **FR-011**: El administrador MAY crear cuentas de barberos (alta por parte del staff, opcional).

### Key Entities

- **Usuario**: persona que accede al sistema; atributos: nombre, email (único), teléfono, rol (cliente/barbero/admin), estado activo.
- **CredencialPasskey**: credencial WebAuthn asociada a un usuario; atributos: credentialId (único), clave pública, contador anti-replay, transports soportados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visitante puede crear una cuenta y quedar autenticado completando el registro con passkey en una sola sesión, sin escribir contraseña.
- **SC-002**: Un usuario registrado inicia sesión exitosamente con su passkey sin asistencia.
- **SC-003**: El registro de un email duplicado es rechazado de forma determinística con respuesta identificable (409).
- **SC-004**: En un navegador sin soporte WebAuthn, el 100% de los intentos de login/registro muestran un mensaje explicativo sin errores de render.
- **SC-005**: El 100% de las rutas privadas sin sesión redirigen al login (verificable por prueba automatizada o manual).
- **SC-006**: Tras el logout, ningún request posterior autenticado se acepta con la sesión previa (cookie invalidada).
- **SC-007**: Auditoría de logs: cero credenciales o secretos presentes en la salida de logs del backend.

## Assumptions

- Alcance: alta de cuenta, autenticación y cierre de sesión.
- Fuera de alcance: recuperación por email, MFA adicional, gestión de roles avanzada.
- Los usuarios poseen un dispositivo/navegador con soporte WebAuthn y autenticación biométrica o PIN.
- El entorno de ejecución garantiza HTTPS (o localhost) para la API WebAuthn.
- La persistencia de usuarios y credenciales está disponible (ver 000-arquitectura).
