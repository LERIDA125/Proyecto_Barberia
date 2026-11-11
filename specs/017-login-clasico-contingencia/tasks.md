# Tasks: Login clásico con email y contraseña (contingencia de presentación)

> Tracking de ejecución de [`spec.md`](./spec.md) / [`plan.md`](./plan.md). `[x]` solo con evidencia.

## 1. Backend

- [x] **1.1** Instalar `bcryptjs` en `backend/` y registrar en `package.json` + lockfile. Evidencia: `npm install bcryptjs` → 1 package added.
- [x] **1.2** Schema zod `loginClasico` en `utils/validation.js` (`email` + `password` no vacía). Evidencia: `backend/src/utils/validation.js`.
- [x] **1.3** `verificarLoginClasico` en `services/auth.service.js`: busca usuario, `bcrypt.compare` contra `password_hash`, 401 uniforme `Email o contraseña incorrectos`, serializer sin hash. Evidencia: `backend/src/services/auth.service.js`.
- [x] **1.4** `loginClasico` en `controllers/auth.controller.js` con `setSessionCookie` + `res.json({ usuario })` (mismo shape que `login/verificar`). Evidencia: `backend/src/controllers/auth.controller.js`.
- [x] **1.5** Ruta `POST /api/auth/login` en `routes/auth.routes.js`. Evidencia: `backend/src/routes/auth.routes.js`.
- [x] **1.6** Seed: `admin@barberia.com` recibe `passwordHash: bcrypt.hashSync('admin123', 10)`. Evidencia: `backend/prisma/seed.js` + ejecución local exitosa.

## 2. Frontend

- [x] **2.1** `loginClasico(email, password)` en `lib/api/auth.ts`. Evidencia: `frontend/src/lib/api/auth.ts`.
- [x] **2.2** `LoginForm.tsx`: form clásico (email + contraseña) con botón "Ingresar (Clásico)", divisor visual y estados propios de carga/error; flujo passkey intacto. Evidencia: `frontend/src/components/auth/LoginForm.tsx`.

## 3. Testing y verificación

- [x] **3.1** 5 tests de `verificarLoginClasico` (happy path, contraseña incorrecta, sin hash, usuario inexistente, falta password). Evidencia: `npm test` → 23/23.
- [x] **3.2** E2E local: seed ejecutado, `POST /api/auth/login` con credenciales correctas → 200 + cookie `sesion` + `GET /api/auth/sesion` autenticado; contraseña incorrecta → 401; sin contraseña → 400.
- [x] **3.3** Suite completa sin regresiones (tests de passkey y bypass intactos). Evidencia: `npm test` → 23/23.
- [x] **3.4** Frontend: `npm run lint` → 0 errores (3 advertencias preexistentes); `npm run build` completado.
- [ ] **3.5** Verificación manual del formulario clásico en navegador real. *(Pendiente; mismo criterio de limitación que 014/016.)*

## 4. Documentación

- [x] **4.1** `spec.md` + `plan.md` + este `tasks.md` en `specs/017-login-clasico-contingencia/`.
- [x] **4.2** Entrada en `specs/index.md` y en `ESTADO.md`.
