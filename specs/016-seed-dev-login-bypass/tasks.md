# Tasks — 016-seed-dev-login-bypass

> **Feature:** Datos de prueba y acceso de desarrollo sin passkey.
> **Fuentes:** `spec.md`, `plan.md`, `backend/prisma/schema.prisma`, `backend/src/services/auth.service.js`, `frontend/src/components/auth/LoginForm.tsx`.
> **Convención:** `[x]` = respaldado por evidencia verificable; `[ ]` = pendiente o no verificado.

## Fase 1 — Documentación previa

- [x] **T001** Crear `spec.md` con problema, alcance, requisitos y criterios de aceptación.
- [x] **T002** Crear `plan.md` con enfoque técnico, decisiones, riesgos y plan de verificación.
- [x] **T003** Crear este `tasks.md` con tareas atómicas y trazabilidad.

## Fase 2 — Seed de datos de prueba

- [x] **T004** Reescribir `backend/prisma/seed.js` con limpieza en orden de claves foráneas y transacción (FR-001, FR-007).
- [x] **T005** Crear el admin `admin@barberia.com` con nombre `Admin Barbería` y rol `admin` (FR-002).
- [x] **T006** Crear los barberos `alejandro@barberia.com` y `marcos@barberia.com` con registro `Barbero`, horario 10:00–20:00 y días laborales (FR-003).
- [x] **T007** Crear los clientes `cliente@barberia.com` y `lucas@barberia.com` (FR-004).
- [x] **T008** Crear los cuatro servicios con precios y duraciones indicados (FR-005).
- [x] **T009** Crear dos turnos pasados `completado` y dos futuros `pendiente` con `fechaFin` derivada de la duración (FR-006).
- [x] **T010** Bloquear la ejecución en producción salvo `SEED_FORCE=true` (FR-008).
- [x] **T011** Documentar `SEED_FORCE` y el requisito de `NODE_ENV` en `backend/.env.example`.

## Fase 3 — Bypass backend

- [x] **T012** Agregar `verificarLoginDev` en `auth.service.js` con validación de email, búsqueda de usuario y guardia `env.nodeEnv === 'development'` (FR-009, FR-012, FR-013).
- [x] **T013** Emitir el aviso exacto con `console.warn` incluyendo el email (FR-011, FR-015).
- [x] **T014** Bifurcar `loginVerificar` en `auth.controller.js` antes de la validación WebAuthn cuando falte `response` y el entorno sea desarrollo (FR-009, FR-010).
- [x] **T015** Mantener intacto el flujo WebAuthn cuando el cuerpo incluye `response` o el entorno no es desarrollo (FR-013, FR-016).

## Fase 4 — Login de desarrollo en UI

- [x] **T016** Agregar `loginDev(email)` en `frontend/src/lib/api/auth.ts`.
- [x] **T017** Condicionar `LoginForm` con `NEXT_PUBLIC_DEV_LOGIN` para enviar solo el email y omitir `startAuthentication` (FR-014).
- [x] **T018** Conservar el flujo actual cuando la variable esté deshabilitada (FR-014).
- [x] **T019** Crear `frontend/.env.example` y propagar `NEXT_PUBLIC_DEV_LOGIN` en `docker-compose.yml`.

## Fase 5 — Testing y verificación

- [x] **T020** Agregar tests de `verificarLoginDev`: happy path, email inexistente, entorno no desarrollo y aviso en consola.
- [x] **T021** Ejecutar `npm test` en `backend/` sin regresiones (SC-007).
- [x] **T022** Ejecutar `node --check` sobre los archivos backend modificados.
- [x] **T023** Ejecutar `npm run lint` y `npx tsc --noEmit` en `frontend/`.
- [x] **T024** Ejecutar el seed y verificar los conteos (SC-001).
- [x] **T025** Ejecutar el seed por segunda vez y verificar idempotencia (SC-002).
- [x] **T026** Verificar el bypass en desarrollo y el aviso en terminal (SC-003, SC-004).
- [x] **T027** Verificar el rechazo del bypass fuera de desarrollo (SC-005).

## Fase 6 — Cierre documental

- [x] **T028** Actualizar `specs/index.md` con la feature 016.
- [x] **T029** Actualizar `ESTADO.md` con el incremento y las limitaciones reales.
- [x] **T030** Marcar en este archivo solo las tareas con evidencia ejecutada.

## Limitaciones de verificación

- El camino de login de desarrollo de la UI (`NEXT_PUBLIC_DEV_LOGIN=true`) se validó por lint y TypeScript, pero no se probó manualmente en un navegador real.
- El seed se ejecutó contra la base local configurada en `backend/.env`; no se probó contra el PostgreSQL del compose.
- La protección de producción del seed no se ejecutó de forma destructiva: se verificó por revisión de código y la guardia `NODE_ENV` del bypass se cubrió con test automatizado.

## Dependencias

- T004–T011 dependen de T001–T003.
- T012–T015 dependen de T001–T003.
- T016–T019 dependen de T012–T015.
- T020–T027 dependen de T004–T019.
- T028–T030 dependen de T020–T027.

## Criterios de finalización

1. El seed deja exactamente 5 usuarios, 2 barberos, 4 servicios y 4 turnos.
2. Una segunda ejecución no duplica registros.
3. El bypass autentica solo con email en desarrollo y emite la cookie de sesión.
4. El bypass es rechazado fuera de desarrollo.
5. La UI conserva el flujo de passkey cuando `NEXT_PUBLIC_DEV_LOGIN` no está activo.
6. La suite del backend pasa sin regresiones.
7. Lint y TypeScript del frontend no reportan errores nuevos.
