# Implementation Plan: Registro y Autenticación con Passkeys

**Branch**: `001-registro-passkeys` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-registro-passkeys/spec.md`

## Summary

Implementar el alta de cuentas y la autenticación sin contraseña mediante passkeys (WebAuthn) usando `@simplewebauthn/server` v14 (decisión del Tech Lead, resuelta) y sesión por cookie `HttpOnly` firmada con HMAC (stateless). El backend expone endpoints de opciones/verificación para registro y login; el frontend implementa los formularios y el guard de rutas. Persistencia de usuarios y credenciales vía MCP PostgreSQL local.

## Endpoints REST (Node.js)

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| `POST` | `/api/auth/registro/opciones` | Genera las opciones de creación de credencial (challenge) para un `nombre`/`email`. | Público |
| `POST` | `/api/auth/registro/verificar` | Verifica la respuesta de WebAuthn y crea el `Usuario` + credencial. | Público |
| `POST` | `/api/auth/login/opciones` | Genera el challenge de autenticación para un usuario existente. | Público |
| `POST` | `/api/auth/login/verificar` | Verifica la aserción WebAuthn e inicia sesión (emite sesión/token). | Público |
| `GET` | `/api/auth/sesion` | Devuelve el usuario autenticado actual. | Autenticado |
| `POST` | `/api/auth/logout` | Cierra la sesión activa. | Autenticado |

**Contratos (alto nivel):**
- `registro/opciones` → `{ nombre, email, telefono? }` ⇒ `PublicKeyCredentialCreationOptions`.
- `registro/verificar` → respuesta WebAuthn ⇒ `{ usuario, ok: true }`.
- `login/opciones` → `{ email }` ⇒ `PublicKeyCredentialRequestOptions`.
- `login/verificar` → aserción WebAuthn ⇒ `{ usuario }` + cookie de sesión `HttpOnly`.

**Errores esperados:** `400` datos inválidos / verificación fallida, `409` email ya registrado, `401` no autenticado.

## Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `RegistroForm` | `app/(auth)/registro/page.tsx` | Formulario de datos + botón "Crear passkey" que invoca la API WebAuthn del navegador. |
| `LoginForm` | `app/(auth)/login/page.tsx` | Ingreso por email y botón "Entrar con passkey". |
| `AuthGuard` | `components/layout/AuthGuard.tsx` | Envuelve rutas privadas y redirige a login si no hay sesión. |
| `UserMenu` | `components/layout/UserMenu.tsx` | Muestra el usuario y la acción "Cerrar sesión". |
| `StatusMessage` | `components/ui/StatusMessage.tsx` | Feedback de éxito/error de la verificación (reutilizable). |

**Estados de UI:** carga (mientras se genera el challenge), error (verificación fallida o dispositivo sin soporte), vacío, éxito.

## Dependencias y Riesgos

- Librería WebAuthn/Passkeys: **`@simplewebauthn/server` v14** (decisión del Tech Lead, resuelta).
- Entidad **`CredencialPasskey`** del modelo de datos (relación `Usuario 1:N CredencialPasskey`).
- Sesión: cookie `HttpOnly` firmada con HMAC (stateless); challenge con TTL en memoria.
- Persistencia vía MCP PostgreSQL local.
- **Riesgos:** soporte desigual de passkeys entre navegadores/dispositivos; necesidad de HTTPS (o `localhost`) para la API WebAuthn.

## Technical Context

**Language/Version**: Backend Node.js (JavaScript); Frontend Next.js (App Router, TypeScript)

**Primary Dependencies**: `@simplewebauthn/server` v14, LangChain/MCP (plataforma), Tailwind CSS

**Storage**: PostgreSQL (acceso vía MCP local)

**Testing**: suite automatizada pendiente; verificación de caso feliz y caso de error por endpoint (CA-01.8); `node --check` (backend), `npx tsc --noEmit` / `npx eslint` (frontend)

**Target Platform**: Web — navegadores modernos con soporte WebAuthn (HTTPS o localhost)

**Project Type**: web-service + web application (monorepo backend/frontend)

**Performance Goals**: latencia de verificación WebAuthn acotada al round-trip del navegador (sin objetivos de negocio fijados)

**Constraints**: secretos solo por variables de entorno; datos sensibles nunca en logs; challenge con TTL

**Scale/Scope**: uso de una barbería (docenas de usuarios)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec antes que código**: PASS — spec `spec.md` fuente de este plan, estado Implemented.
- **II. Gates secuenciales**: PASS — feature implementada tras aprobación de spec; CA-01.8 (tests) pendiente documentado.
- **III. Contratos primero**: PASS — todos los endpoints y respuestas definidos aquí derivan de la spec; nada inventado.
- **IV. Testing obligatorio**: PASS CON PENDIENTE — CA-01.8 pide test por endpoint; la suite automatizada figura como pendiente en el estado del proyecto.
- **V. Modularidad y capas**: PASS — auth en `api/middlewares` + services; la sesión no se resuelve en controllers con lógica de negocio.

## Project Structure

### Documentation (this feature)

```text
specs/001-registro-passkeys/
├── plan.md              # Este archivo
└── spec.md              # Especificación (qué)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   ├── routes/          # auth.routes (montado en routes/index)
│   │   ├── controllers/     # adaptadores HTTP de auth
│   │   └── middlewares/     # requiereAuth (sesión por cookie)
│   ├── services/            # lógica de negocio de usuarios/credenciales
│   ├── data/repositories/   # acceso a datos
│   └── mcp/postgres/        # persistencia vía MCP
└── tests/
    ├── unit/
    └── integration/

frontend/
└── src/
    ├── app/(auth)/          # registro/page.tsx, login/page.tsx
    └── components/
        ├── layout/          # AuthGuard, UserMenu
        └── ui/              # StatusMessage
```

**Structure Decision**: estructura web application (backend + frontend) existente del repositorio; este feature agrega rutas bajo `app/(auth)/` y middlewares de sesión en backend, sin alterar la estructura base.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
