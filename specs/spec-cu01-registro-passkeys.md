# spec-cu01-registro-passkeys.md

> **Caso de Uso:** CU-01 — Registro y Autenticación con Passkeys
> **Feature:** Gestión de identidad y acceso
> **Rol autor:** Arquitecto / Tech Lead
> **Estado:** Aprobado e implementado (decisión Tech Lead: `@simplewebauthn/server` + sesión por cookie). Backend y Frontend (login/registro) implementados.
> **Metodología:** Spec-Driven Development — ver `IA_WORKFLOW.md` y `SDD.md`

---

## 1. Descripción

Permitir que un cliente se registre y acceda al sistema sin contraseña tradicional, usando **passkeys** (WebAuthn). El usuario crea una credencial vinculada a su dispositivo (huella, Face ID, PIN o llave de seguridad) y luego inicia sesión con ella.

**Actores:** Cliente (primario), Administrador (opcional, alta de barberos).
**Alcance:** alta de cuenta, autenticación y cierre de sesión. **Fuera de alcance:** recuperación por email, MFA adicional, gestión de roles avanzada.

---

## 2. Endpoints REST (Node.js)

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

---

## 3. Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `RegistroForm` | `app/(auth)/registro/page.tsx` | Formulario de datos + botón "Crear passkey" que invoca la API WebAuthn del navegador. |
| `LoginForm` | `app/(auth)/login/page.tsx` | Ingreso por email y botón "Entrar con passkey". |
| `AuthGuard` | `components/layout/AuthGuard.tsx` | Envuelve rutas privadas y redirige a login si no hay sesión. |
| `UserMenu` | `components/layout/UserMenu.tsx` | Muestra el usuario y la acción "Cerrar sesión". |
| `StatusMessage` | `components/ui/StatusMessage.tsx` | Feedback de éxito/error de la verificación (reutilizable). |

**Estados de UI:** carga (mientras se genera el challenge), error (verificación fallida o dispositivo sin soporte), vacío, éxito.

---

## 4. Criterios de Aceptación

- [ ] **CA-01.1** Un visitante puede crear una cuenta proporcionando nombre, email y una passkey, y queda autenticado al finalizar.
- [ ] **CA-01.2** Un usuario registrado puede iniciar sesión usando su passkey, sin escribir contraseña.
- [ ] **CA-01.3** No se puede registrar dos veces el mismo `email` (respuesta `409` con mensaje claro).
- [ ] **CA-01.4** Si el dispositivo/navegador no soporta WebAuthn, la UI muestra un mensaje explicativo y no rompe.
- [ ] **CA-01.5** Toda ruta privada redirige a `/login` cuando no hay sesión activa.
- [ ] **CA-01.6** El `logout` invalida la sesión y borra la cookie; las rutas privadas vuelven a redirigir.
- [ ] **CA-01.7** Las credenciales y datos sensibles nunca se registran en logs ni se exponen en el cliente.
- [ ] **CA-01.8** Existe test del caso feliz y de al menos un caso de error por endpoint.

---

## 5. Dependencias

- Librería WebAuthn/Passkeys: **`@simplewebauthn/server` v14** (decisión del Tech Lead, resuelta).
- Entidad **`CredencialPasskey`** agregada al `SDD.md` (relación `Usuario 1:N CredencialPasskey`).
- Sesión: cookie `HttpOnly` firmada con HMAC (stateless); challenge con TTL en memoria.
- Persistencia vía MCP PostgreSQL local.

## 6. Riesgos

- Soporte desigual de passkeys entre navegadores/dispositivos.
- Necesidad de HTTPS (o `localhost`) para que la API WebAuthn funcione.
