# Tasks — 001-registro-passkeys

> **Feature:** Registro y Autenticación con Passkeys (CU-01)
> **Fuentes:** `spec.md`, `plan.md`, `backend/src/services/auth.service.js`, `backend/src/utils/session.js`, `backend/src/middlewares/auth.middleware.js`, `backend/src/tests/auth.test.js`, `frontend/src/components/auth/`, `ESTADO.md`.
> **Convención:** `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.
> **Nota:** backfill documental posterior al desarrollo. No demuestra uso histórico de Spec Kit.

## Fase 1 — Preparación y configuración

- [x] **T001** Incorporar `@simplewebauthn/server` v14 en `backend/package.json` y `@simplewebauthn/browser` v14 en `frontend/package.json`.
- [x] **T002** Configurar `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME` y `WEBAUTHN_ORIGIN` en `backend/src/config/env.js` y `.env.example`.
- [x] **T003** Definir el modelo `Usuario` con `email` único, `rol` y `activo` en `backend/prisma/schema.prisma`.
- [x] **T004** Definir el modelo `CredencialPasskey` con `credentialId` único, `publicKey`, `counter` y relación 1:N con `Usuario` (FR-010) en `backend/prisma/schema.prisma`.
- [x] **T005** Definir el contrato de sesión: cookie `sesion` `HttpOnly`, `SameSite=Lax`, firmada con HMAC-SHA256 y TTL de 7 días en `backend/src/utils/session.js`.
- [x] **T006** Documentar los seis endpoints de auth y sus contratos en `plan.md`.

## Fase 2 — Implementación

- [x] **T007** Implementar `POST /api/auth/registro/opciones` en `backend/src/controllers/auth.controller.js` y `backend/src/services/auth.service.js` (FR-001).
- [x] **T008** Implementar `POST /api/auth/registro/verificar` con verificación WebAuthn, alta de usuario y credencial, y emisión de cookie (FR-001, FR-002).
- [x] **T009** Rechazar email duplicado con respuesta `409` (FR-003, SC-003).
- [x] **T010** Implementar `POST /api/auth/login/opciones` para generar el challenge de autenticación (FR-004).
- [x] **T011** Implementar `POST /api/auth/login/verificar`, actualización del `counter` y emisión de sesión (FR-004).
- [x] **T012** Implementar `GET /api/auth/sesion` para devolver el usuario autenticado (FR-005).
- [x] **T013** Implementar `POST /api/auth/logout` con borrado de cookie (FR-006).
- [x] **T014** Implementar `authOpcional`, `requiereAuth` y `requiereRol` en `backend/src/middlewares/auth.middleware.js` (FR-005, FR-007).
- [x] **T015** Implementar challenge con TTL en memoria en `backend/src/services/auth.service.js`.
- [x] **T016** Implementar `RegistroForm` en `frontend/src/components/auth/RegistroForm.tsx` y la página `frontend/src/app/registro/page.tsx`.
- [x] **T017** Implementar `LoginForm` en `frontend/src/components/auth/LoginForm.tsx` y la página `frontend/src/app/login/page.tsx`.
- [x] **T018** Implementar feedback de éxito/error con `StatusMessage` en `frontend/src/components/ui/StatusMessage.tsx`.
- [ ] **T019** Implementar el `AuthGuard` dedicado propuesto en `frontend/src/components/layout/AuthGuard.tsx`. No existe con ese nombre; verificar si la protección se resuelve en las páginas o en `useSesion`.
- [ ] **T020** Implementar `UserMenu` como componente dedicado en `frontend/src/components/layout/UserMenu.tsx`. No existe con ese nombre; el cierre de sesión podría estar en `Navbar.tsx`.
- [ ] **T021** Implementar el alta de barberos por parte del administrador (FR-011). No se encontró un endpoint específico para esta capacidad.

## Fase 3 — Integración

- [x] **T022** Conectar el registro con la API real y dejar la sesión activa al finalizar (SC-001).
- [x] **T023** Conectar el login con la API real y persistir la cookie de sesión (SC-002).
- [x] **T024** Proteger las rutas privadas y redirigir a login sin sesión (FR-007, SC-005). Verificar el mecanismo exacto usado en el frontend.
- [ ] **T025** Verificar el mensaje explicativo cuando el navegador no soporta WebAuthn (FR-008, SC-004).
- [ ] **T026** Verificar que el logout invalide la cookie y que un request posterior sea rechazado (SC-006).

## Fase 4 — Pruebas

- [x] **T027** Implementar `backend/src/tests/auth.test.js` con 4 casos: happy path con actualización de counter, usuario inexistente, falta de challenge y credencial ajena.
- [x] **T028** Ejecutar `npm test` en `backend/` y confirmar los 4 tests de auth en verde. Evidencia: suite total `8/8` en verde (ver `ESTADO.md`).
- [ ] **T029** Agregar al menos un test de caso feliz y uno de error por cada endpoint de auth (CA-01.8, SC-006). Hoy no hay cobertura de controllers ni de los seis endpoints.
- [ ] **T030** Ejecutar una prueba manual o automatizada del flujo WebAuthn real (registro + logout + login) con un autenticador de navegador.
- [ ] **T031** Verificar con prueba automatizada que las rutas privadas sin sesión devuelvan `401` o redirijan al login (SC-005).
- [ ] **T032** Auditar logs del backend y confirmar que no se exponen credenciales, challenges ni claves (FR-009, SC-007).
- [ ] **T033** Ejecutar `npm run lint` en `frontend/` y registrar el resultado. Evidencia previa: falla por `Footer.tsx:18`.

## Fase 5 — Documentación

- [x] **T034** Documentar `spec.md` y `plan.md` de la feature.
- [x] **T035** Documentar la corrección del bug de `verificarLogin` (TDZ/`ReferenceError`) en `ESTADO.md`.
- [x] **T036** Crear este `tasks.md` como backfill.
- [ ] **T037** Actualizar el `Status` de la spec con la fecha de verificación final y enlazar la evidencia de pruebas.

## Dependencias

- T007-T015 dependen de T001-T006.
- T016-T020 dependen de T007-T015.
- T022-T026 dependen de T016-T020.
- T029-T033 dependen de T022-T026.

## Criterios de finalización

1. Los seis endpoints existen y respetan los contratos del `plan.md`.
2. La cookie de sesión es `HttpOnly`, firmada y se borra en logout.
3. El registro rechaza email duplicado con `409`.
4. El flujo WebAuthn real fue probado y registrado; si no, permanece `[ ]`.
5. Hay al menos un test de caso feliz y uno de error por endpoint.
6. No hay secretos en logs.
7. `tasks.md` y la spec reflejan el estado real, sin afirmar pruebas no ejecutadas.
