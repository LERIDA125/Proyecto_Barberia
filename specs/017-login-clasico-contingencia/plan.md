# Implementation Plan: Login clásico con email y contraseña (contingencia de presentación)

**Branch**: `017-login-clasico-contingencia` | **Date**: 2026-11-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-login-clasico-contingencia/spec.md`

## Summary

Agregar un login tradicional con email y contraseña como respaldo del flujo con passkeys. La contraseña se guarda solo para el admin del seed, hasheada con `bcryptjs` en el campo existente `password_hash` (sin cambios de esquema). El backend expone `POST /api/auth/login` que valida credenciales contra el hash y emite la misma cookie de sesión firmada (HMAC) que el login con passkey. El frontend agrega un formulario clásico debajo del flujo existente en la pantalla de login.

## Endpoints REST (Node.js)

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| `POST` | `/api/auth/login` | Login clásico: valida `email` + `password` contra `password_hash` (bcrypt) y emite sesión. | Público |

**Contrato (alto nivel):**
- `login` → `{ email, password }` ⇒ `{ usuario }` + cookie de sesión `HttpOnly` firmada (idéntica a la de `login/verificar`).

**Errores esperados:** `400` body inválido (zod / campos faltantes), `401` credenciales incorrectas con mensaje uniforme `Email o contraseña incorrectos` (no revela existencia del email ni presencia de hash).

**Endpoints existentes que NO cambian:** `/login/opciones`, `/login/verificar`, `/registro/*`, `/sesion`, `/logout` (feature 001 y bypass de 016 intactos).

## Componentes de UI (Next.js + Tailwind)

| Componente | Cambio |
|------------|--------|
| `LoginForm` | Se agrega un segundo `<form>` (email + contraseña) con botón "Ingresar (Clásico)" debajo del flujo con passkey, separado por un divisor. El form passkey queda intacto. |
| `lib/api/auth.ts` | Nueva función `loginClasico(email, password)` con el mismo patrón que `loginConPasskey`. |

**Estados de UI:** carga y error propios del formulario clásico (`errorClasico` / `cargandoClasico`), independientes de los del form passkey. El botón clásico no depende del soporte WebAuthn.

## Dependencias y Riesgos

- **`bcryptjs`** (nueva dependencia, aprobada por el usuario): JS puro, sin binarios nativos — determinista en Windows y en el deploy de Vercel Services donde `npm ci` reconstruye `node_modules`. `bcrypt` nativo se descartó por riesgo de build (node-gyp).
- Campo `password_hash` existente en `usuarios` (migración init; nullable).
- **Riesgo bajo**: la contraseña de demo viaja en texto plano en el body del request (HTTPS la protege en producción); el hash nunca sale del server (serializer existente).

## Technical Context

**Language/Version**: Backend Node.js (JavaScript); Frontend Next.js (App Router, TypeScript)

**Primary Dependencies**: `bcryptjs`, express + zod (validación), cookie firmada HMAC existente

**Storage**: PostgreSQL vía Prisma (`usuarios.password_hash`)

**Testing**: `node --test` en backend (5 tests nuevos del service); verificación E2E local con curl (login correcto → cookie → sesión; credenciales inválidas → 401); `npm run lint` + `npm run build` en frontend.

**Constraints**: secretos solo por variables de entorno; el hash y las contraseñas nunca se loguean.

## Constitution Check

- **I. Spec antes que código**: PASS — requerimiento aprobado explícitamente por el usuario (mensaje con alcance y contratos definidos); esta spec y este plan se versionan junto al código en el mismo commit.
- **II. Gates secuenciales**: PASS — GATE 1/2 resueltos por el requerimiento aprobado del usuario (decisión de contingencia para la presentación); GATE 3/4 verificados con tests y E2E.
- **III. Contratos primero**: PASS — el endpoint nuevo y su contrato de errores están definidos aquí; no se modificaron contratos existentes.
- **IV. Testing obligatorio**: PASS — 5 tests nuevos (happy path + 4 errores); suite total 23/23; E2E con curl contra el server local.
- **V. Modularidad y capas**: PASS — lógica en `services/auth.service.js`, controller solo adapta HTTP, cookie centralizada en `utils/session.js`, UI consume solo el contrato.

## Project Structure

```text
backend/
├── prisma/seed.js                      # admin con passwordHash bcrypt
└── src/
    ├── routes/auth.routes.js            # POST /login
    ├── controllers/auth.controller.js   # loginClasico
    ├── services/auth.service.js         # verificarLoginClasico
    ├── utils/validation.js              # schema zod loginClasico
    └── tests/auth.test.js               # 5 tests nuevos

frontend/src/
├── components/auth/LoginForm.tsx        # form clásico + divisor
└── lib/api/auth.ts                      # loginClasico()

specs/017-login-clasico-contingencia/     # spec.md + plan.md + tasks.md
```

## Complexity Tracking

Sin violaciones de la constitución que justificar. La dependencia nueva (`bcryptjs`) fue aprobada explícitamente por el usuario en el requerimiento.
