# Implementation Plan: Datos de prueba y acceso de desarrollo sin passkey

**Branch**: `016-seed-dev-login-bypass` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-seed-dev-login-bypass/spec.md`

## Summary

Reescribir `backend/prisma/seed.js` para limpiar y poblar la base local con un conjunto completo y repetible de datos de prueba (1 admin, 2 barberos, 2 clientes, 4 servicios y 4 turnos). Agregar un bypass de WebAuthn exclusivo de desarrollo en la verificación de login: si el entorno es `development` y no llega una aserción WebAuthn, el backend autentica solo con el email, emite la cookie de sesión existente y registra un aviso en terminal. Para que el bypass sea utilizable desde la interfaz, el frontend incorpora un camino de login de desarrollo gobernado por `NEXT_PUBLIC_DEV_LOGIN`.

## Technical Context

**Language/Version**: Backend Node.js (JavaScript); Frontend Next.js (App Router, TypeScript)

**Primary Dependencies**: Express, Prisma + PostgreSQL, `@simplewebauthn/server` v14, React

**Storage**: PostgreSQL local (Prisma)

**Testing**: `node --test` en `backend/`; `npx tsc --noEmit` y `npm run lint` en `frontend/`

**Target Platform**: Web — entorno local de desarrollo

**Project Type**: web-service + web application (monorepo backend/frontend)

**Constraints**:
- El bypass MUST depender de `NODE_ENV === 'development'` y quedar inactivo en cualquier otro entorno.
- No se modifican `schema.prisma`, migraciones ni los contratos del flujo normal de autenticación.
- El seed es destructivo por diseño y MUST protegerse contra ejecuciones en producción.
- No se registran secretos ni credenciales en logs.

**Scale/Scope**: Uso local de una barbería; datos de prueba acotados y deterministas.

## Decisiones técnicas

### 1. Seed destructivo con transacción

- El seed limpia primero las tablas dependientes en orden de claves foráneas:
  `notificacion` → `credencialPasskey` → `turno` → `bloqueo` → `barbero` → `servicio` → `usuario`.
- Luego recrea los datos dentro de una transacción interactiva de Prisma.
- Motivo: garantizar idempotencia y evitar duplicados sin depender de `upsert` para relaciones con IDs generados.
- Protección: si `NODE_ENV !== 'development'` y `SEED_FORCE !== 'true'`, el proceso aborta antes de borrar nada.

### 2. Turnos relativos a la fecha de ejecución

- Dos turnos pasados: `completado`.
- Dos turnos futuros: `pendiente`.
- Fechas calculadas en `America/Argentina/Buenos_Aires` y `fechaFin` derivada de `duracionMin` del servicio.
- Los turnos futuros se ubican en días laborales (lunes a viernes) para que sean consistentes con la agenda.

### 3. Bypass en la capa de servicio con doble guardia

- `auth.service.verificarLoginDev(body)` valida email, busca el usuario y emite el usuario serializado.
- El servicio rechaza la operación si `env.nodeEnv !== 'development'` (defensa en profundidad).
- El controlador solo invoca `verificarLoginDev` cuando `env.nodeEnv === 'development'` y el cuerpo no trae `response`.
- Si en desarrollo llega una aserción WebAuthn, se ejecuta el flujo criptográfico normal.
- El aviso se emite con `console.warn` e incluye únicamente el email.

### 4. Login de desarrollo en la UI opt-in

- `NEXT_PUBLIC_DEV_LOGIN=true` habilita el camino de desarrollo en `LoginForm`.
- Con la variable ausente o distinta de `true`, el componente conserva el flujo actual (`/login/opciones` + `startAuthentication` + `/login/verificar`).
- En modo desarrollo, el formulario envía solo `{ email }` a `/api/auth/login/verificar` y no invoca la API WebAuthn del navegador.
- Motivo: el flujo actual nunca llega a `/login/verificar` con usuarios sin passkey porque `/login/opciones` falla y `startAuthentication` exige una credencial.

## Endpoints REST

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| `POST` | `/api/auth/login/verificar` | Verifica la aserción WebAuthn y emite sesión. En `development`, acepta `{ email }` sin `response` y emite sesión sin verificación criptográfica. | Público |

**Contrato del bypass (solo desarrollo):**

- Request: `{ "email": "admin@barberia.com" }`
- Response `200`: `{ "usuario": { "id", "nombre", "email", "telefono", "rol", "activo", "createdAt" } }` + cookie `sesion` HttpOnly.
- Errores: `400` email inválido; `404` usuario inexistente; fuera de desarrollo, el esquema existente rechaza la falta de `response` con `400`; el servicio devuelve `403` si el bypass se invoca fuera de desarrollo.
- Cuando el cuerpo incluye `response`, se aplica el contrato existente de 001 sin cambios.

## Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `backend/prisma/seed.js` | Reescritura completa: limpieza transaccional + datos de prueba. |
| `backend/src/services/auth.service.js` | Nueva función `verificarLoginDev` y guardia de entorno. |
| `backend/src/controllers/auth.controller.js` | Bifurcación del bypass en `loginVerificar` antes de la validación WebAuthn. |
| `backend/src/tests/auth.test.js` | Tests del bypass: happy path, email inexistente, entorno no desarrollo, aviso en consola. |
| `frontend/src/lib/api/auth.ts` | Nueva función `loginDev(email)`. |
| `frontend/src/components/auth/LoginForm.tsx` | Camino de login de desarrollo condicionado por `NEXT_PUBLIC_DEV_LOGIN`. |
| `backend/.env.example` | Documentar `SEED_FORCE` y el requisito de `NODE_ENV`. |
| `frontend/.env.example` | Nuevo archivo con `NEXT_PUBLIC_DEV_LOGIN=false` y `NEXT_PUBLIC_API_URL`. |
| `docker-compose.yml` | Propagar `NEXT_PUBLIC_DEV_LOGIN` al contenedor de frontend. |
| `specs/016-seed-dev-login-bypass/*` | Spec, plan y tareas. |
| `specs/index.md` | Alta de la feature 016. |
| `ESTADO.md` | Registro del incremento y sus limitaciones. |

## Estructura del proyecto

```text
backend/
├── prisma/
│   └── seed.js
└── src/
    ├── services/auth.service.js
    ├── controllers/auth.controller.js
    └── tests/auth.test.js

frontend/
└── src/
    ├── lib/api/auth.ts
    └── components/auth/LoginForm.tsx
```

## Constitution Check

- **I. Spec antes que código**: PASS — `spec.md` de 016 creada antes de la implementación.
- **II. Gates secuenciales**: PASS — requerimiento del usuario relevado; spec, plan y tareas antes del código.
- **III. Contratos primero**: PASS — el contrato del flujo normal no cambia; el bypass es aditivo y exclusivo de desarrollo.
- **IV. Testing obligatorio**: PASS — se agregan tests del bypass y se ejecuta la suite completa.
- **V. Modularidad y capas**: PASS — la lógica del bypass vive en `auth.service.js`; el controlador solo delega y adapta HTTP; el seed no contiene lógica de negocio.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Bypass activo por error en producción | Guardia doble (`service` + `controller`) sobre `NODE_ENV`; test explícito de rechazo. |
| Seed ejecutado contra producción | Aborto por `NODE_ENV` distinto de `development` salvo `SEED_FORCE=true`. |
| Pérdida de datos manuales | El seed es destructivo por pedido explícito; se documenta en el aviso de ejecución. |
| `NEXT_PUBLIC_DEV_LOGIN` queda activo en un build público | La variable es explícita, por defecto `false`, y no se habilita en el compose sin configuración del usuario. |
| Fechas de turnos inconsistentes con la agenda | Cálculo en zona horaria del negocio y selección de días laborales. |

## Verification Plan

1. Ejecutar `npm test` en `backend/` y confirmar que la suite completa pasa.
2. Ejecutar `node --check` sobre los archivos backend modificados.
3. Ejecutar `npm run lint` y `npx tsc --noEmit` en `frontend/`.
4. Ejecutar el seed y verificar conteos con una consulta Prisma de solo lectura.
5. Ejecutar el seed una segunda vez y comprobar idempotencia.
6. Probar el bypass contra el backend en desarrollo y confirmar el aviso en terminal.
7. Confirmar que el flujo de passkey permanece intacto cuando no corresponde el bypass.
