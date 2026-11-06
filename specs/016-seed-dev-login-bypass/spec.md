# Feature Specification: Datos de prueba y acceso de desarrollo sin passkey

**Feature Branch**: `016-seed-dev-login-bypass`

**Created**: 2026-11-05

**Status**: Implemented

**Verification**: `npm test` en `backend/` → 18/18; seed ejecutado dos veces con 1 admin, 2 barberos, 2 clientes, 4 servicios y 4 turnos; seed con `NODE_ENV=production` → aborta antes de limpiar; bypass en desarrollo → HTTP 200 con cookie `sesion`, aviso en terminal y `GET /api/auth/sesion` devuelve el usuario; request equivalente en producción → HTTP 400 sin sesión y sin aviso; `npm run lint` en `frontend/` → 0 errores (3 advertencias preexistentes); `npx tsc --noEmit` → sin errores. Limitación: el camino de login de desarrollo de la UI no se verificó manualmente en un navegador real.

**Input**: User description: "Necesito poblar mi base de datos de la Barbería con datos completos para pruebas locales y un bypass de login porque el sistema usa Passkeys (WebAuthn) y no puedo iniciar sesión con usuarios generados por script."

## Problem Statement

El seed actual crea un conjunto mínimo de datos (un admin, dos barberos, cuatro servicios y un solo cliente) y no genera turnos. Además, los usuarios creados por script no tienen credenciales WebAuthn, por lo que el flujo de login con passkeys —el único habilitado— es inutilizable para probar la aplicación localmente con esos usuarios.

## Scope

### In Scope

- Reescritura del seed para limpiar la base y recrear un conjunto completo y repetible de datos de prueba: usuarios de los tres roles, barberos con agenda, catálogo de servicios y turnos pasados/futuros.
- Un mecanismo de inicio de sesión por email disponible **solo en desarrollo**, que omite la verificación criptográfica de WebAuthn y emite la misma sesión que el login normal.
- Un aviso explícito en la terminal cada vez que el mecanismo de desarrollo se usa.
- Un acceso de desarrollo en la pantalla de login, activado por una variable pública explícita, para que el mecanismo sea utilizable desde la interfaz.
- Pruebas automatizadas del nuevo comportamiento y verificación de que el flujo normal no cambia.

### Out of Scope

- Cambios al flujo de autenticación en producción o al contrato de passkeys para usuarios reales.
- Creación de credenciales WebAuthn falsas o almacenamiento de claves privadas.
- Recuperación de cuentas, contraseñas, MFA adicional o gestión avanzada de roles.
- Sembrado de datos en producción.
- Cambios al modelo de datos o a las migraciones de Prisma.
- Cambios a la lógica de reservas, disponibilidad, métricas o chatbot.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Poblar la base local con datos representativos (Priority: P1)

Un desarrollador necesita una base local con usuarios, barberos, servicios y turnos suficientes para probar la agenda, el panel, el historial y el login sin cargar datos a mano.

**Why this priority**: Sin datos no se pueden verificar los flujos principales de la aplicación.

**Independent Test**: Ejecutar el comando de seed y comprobar que existen exactamente los usuarios, barberos, servicios y turnos esperados, y que una segunda ejecución deja el mismo resultado.

**Acceptance Scenarios**:

1. **Given** una base local con datos previos, **When** se ejecuta el seed, **Then** los datos operativos previos se eliminan y se recrean los datos de prueba definidos.
2. **Given** el seed ejecutado, **When** se consultan los usuarios, **Then** existen un admin, dos barberos y dos clientes con los emails y roles indicados.
3. **Given** el seed ejecutado, **When** se consultan los barberos, **Then** ambos tienen registro de barbero y horario laboral de 10:00 a 20:00.
4. **Given** el seed ejecutado, **When** se consultan los servicios, **Then** existen los cuatro servicios con sus precios y duraciones.
5. **Given** el seed ejecutado, **When** se consultan los turnos, **Then** existen dos turnos pasados completados y dos turnos futuros pendientes, asociados a los clientes, barberos y servicios creados.
6. **Given** el seed ejecutado una vez, **When** se ejecuta nuevamente, **Then** no se duplican registros.

---

### User Story 2 - Iniciar sesión sin passkey en desarrollo (Priority: P1)

Un desarrollador quiere entrar a la aplicación con un usuario sembrado enviando solo su email, sin disponer de una passkey registrada para ese usuario.

**Why this priority**: Es la única forma de probar los flujos autenticados con usuarios generados por script.

**Independent Test**: Con el backend en desarrollo, iniciar sesión enviando únicamente el email de un usuario sembrado y verificar que la sesión queda activa y que el aviso de bypass aparece en la terminal.

**Acceptance Scenarios**:

1. **Given** el backend en entorno de desarrollo y un usuario existente, **When** se envía solo el email al endpoint de verificación de login, **Then** se emite la cookie de sesión y se devuelve el usuario.
2. **Given** el mismo escenario, **When** el bypass se ejecuta, **Then** la terminal muestra el aviso de bypass con el email utilizado.
3. **Given** un email inexistente, **When** se intenta el bypass, **Then** la operación se rechaza con un error identificable y no se emite sesión.
4. **Given** la pantalla de login con el acceso de desarrollo habilitado, **When** el desarrollador envía su email, **Then** inicia sesión sin que el navegador solicite una passkey.
5. **Given** la pantalla de login sin el acceso de desarrollo habilitado, **When** el desarrollador envía su email, **Then** el flujo normal de passkey no cambia.

---

### User Story 3 - El bypass no puede usarse fuera de desarrollo (Priority: P1)

El equipo necesita garantizar que la omisión de WebAuthn sea imposible en producción.

**Why this priority**: Un bypass activo en producción anularía la autenticación de todos los usuarios.

**Independent Test**: Ejecutar el endpoint sin entorno de desarrollo y comprobar que exige la verificación WebAuthn normal y que no se emite sesión con solo el email.

**Acceptance Scenarios**:

1. **Given** el backend con entorno distinto de desarrollo, **When** se envía solo el email al endpoint de verificación, **Then** la solicitud se rechaza y no se emite sesión.
2. **Given** el backend con entorno distinto de desarrollo, **When** se envía una aserción WebAuthn válida, **Then** el login normal sigue funcionando.
3. **Given** la interfaz sin la variable pública de desarrollo, **When** un usuario inicia sesión, **Then** no existe ningún camino de UI que omita la passkey.

---

### Edge Cases

- **NODE_ENV ausente o distinto de `development`**: el bypass MUST quedar deshabilitado. La configuración del proyecto debe declarar explícitamente el entorno de desarrollo.
- **Base de datos no disponible**: el seed falla con un mensaje claro y no deja un estado parcial si la transacción no se completa.
- **Reejecución del seed**: la limpieza previa garantiza idempotencia; los datos manuales de prueba se pierden por diseño.
- **Seed apuntado accidentalmente fuera de desarrollo**: el proceso MUST abortar salvo confirmación explícita.
- **Email inexistente o inválido en el bypass**: se responde con error y no se crea ningún usuario.
- **Usuario inactivo**: se mantiene el comportamiento actual del login; esta feature no altera la política de cuentas.
- **Passkey presente en desarrollo**: si se envía una aserción WebAuthn, se conserva el flujo criptográfico normal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El seed MUST eliminar los datos operativos previos (notificaciones, credenciales, turnos, bloqueos, barberos, servicios y usuarios) antes de recrear el conjunto de prueba.
- **FR-002**: El seed MUST crear exactamente un usuario administrador con email `admin@barberia.com`, nombre `Admin Barbería` y rol `admin`.
- **FR-003**: El seed MUST crear dos usuarios barberos con emails `alejandro@barberia.com` y `marcos@barberia.com`, rol `barbero`, cada uno con su registro de barbero y horario de 10:00 a 20:00.
- **FR-004**: El seed MUST crear dos usuarios clientes con emails `cliente@barberia.com` y `lucas@barberia.com`, rol `cliente`.
- **FR-005**: El seed MUST crear cuatro servicios: Corte Clásico ($8.000, 30 min), Corte Fade / Degradado ($10.000, 45 min), Perfilado de Barba ($6.000, 30 min) y Combo Corte + Barba ($14.000, 60 min).
- **FR-006**: El seed MUST crear dos turnos pasados con estado `completado` y dos turnos futuros con estado `pendiente`, asociados a los clientes, barberos y servicios creados.
- **FR-007**: El seed MUST ser idempotente: ejecutarlo varias veces deja el mismo conjunto de datos, sin duplicados.
- **FR-008**: El seed MUST abortar cuando el entorno no sea desarrollo, salvo confirmación explícita mediante una variable de entorno.
- **FR-009**: En entorno de desarrollo, el sistema MUST permitir iniciar sesión enviando solo el email al endpoint de verificación de login, sin exigir aserción WebAuthn.
- **FR-010**: El login de desarrollo MUST emitir la misma cookie de sesión firmada que el login con passkey y devolver el usuario serializado.
- **FR-011**: Cada uso del login de desarrollo MUST registrar en la terminal un aviso que incluya el email autenticado y mencione explícitamente el bypass de WebAuthn por entorno de desarrollo.
- **FR-012**: El login de desarrollo MUST rechazar emails inválidos o inexistentes sin emitir sesión.
- **FR-013**: Fuera de desarrollo, el endpoint de verificación MUST mantener la exigencia de la aserción WebAuthn y MUST NOT aceptar solo el email.
- **FR-014**: La pantalla de login MUST ofrecer el acceso de desarrollo únicamente cuando una variable pública explícita lo habilite; con la variable deshabilitada, el comportamiento actual no cambia.
- **FR-015**: El aviso de bypass MUST NOT registrar credenciales, claves públicas, tokens ni secretos.
- **FR-016**: La feature MUST NOT modificar el esquema Prisma ni los contratos existentes del flujo normal de autenticación.

### Key Entities

- **Usuario**: cuenta con nombre, email único, rol y estado activo.
- **Barbero**: registro profesional asociado a un usuario, con horario y días laborales.
- **Servicio**: prestación con nombre, duración y precio.
- **Turno**: reserva de un cliente con un barbero, un servicio, una franja y un estado.
- **Sesión**: cookie firmada que identifica al usuario autenticado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una ejecución del seed deja exactamente 5 usuarios (1 admin, 2 barberos, 2 clientes), 2 registros de barbero, 4 servicios y 4 turnos.
- **SC-002**: Una segunda ejecución consecutiva del seed deja los mismos conteos, sin duplicados.
- **SC-003**: Con el backend en desarrollo, el 100% de los intentos de login con un email sembrado y sin aserción WebAuthn obtiene sesión válida.
- **SC-004**: El 100% de los usos del bypass produce el aviso en terminal con el email utilizado.
- **SC-005**: Con el backend fuera de desarrollo, el 100% de los intentos de login solo con email es rechazado.
- **SC-006**: Con la variable pública de desarrollo deshabilitada, el 100% de los intentos desde la UI sigue el flujo de passkey.
- **SC-007**: La suite automatizada del backend pasa sin regresiones.

## Assumptions

- El seed se ejecuta contra una base de datos local o de desarrollo, nunca contra datos productivos.
- `NODE_ENV=development` está declarado en el entorno local del backend, como ya ocurre en `.env.example` y en el compose.
- La variable pública del frontend se define en tiempo de arranque/compilación del frontend, según el comportamiento estándar de Next.js.
- Los cinco usuarios sembrados no tienen passkeys; el bypass es la vía de acceso prevista para ellos en desarrollo.
- La zona horaria del negocio es `America/Argentina/Buenos_Aires` y los turnos de prueba se generan en esa zona.

## Dependencies

- Modelo de datos existente de `backend/prisma/schema.prisma` (usuarios, barberos, servicios, turnos).
- Servicio y controlador de autenticación existentes (feature 001).
- Pantalla de login existente (feature 001).
- Suite de pruebas con `node --test` (feature 001).

## Traceability

- Plan técnico: [`plan.md`](./plan.md)
- Tareas: [`tasks.md`](./tasks.md)
- Índice de specs: [`../index.md`](../index.md)
