# Sistema Integral de Gestión y Reservas para Barbería

Sistema web completo para la gestión operativa de una barbería: agenda de turnos, clientes, servicios, barberos y métricas de negocio. Incluye un **asistente inteligente con IA (LangChain + RAG)** capaz de reservar, consultar y cancelar turnos en lenguaje natural, y **sincronización bidireccional con Google Calendar vía MCP** (Model Context Protocol).

Los clientes se autentican con **Passkeys (WebAuthn)** — sin contraseñas — desde el navegador.

---

## Índice

- [Arquitectura](#arquitectura)
- [Casos de uso (CU-01 → CU-10)](#casos-de-uso-cu-01--cu-10)
- [AI Engineering](#ai-engineering)
- [Model Context Protocol (MCP)](#model-context-protocol-mcp)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modelo de datos](#modelo-de-datos)

---

## Arquitectura

### Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | **Next.js 16** (App Router) + **Tailwind CSS 4** + TypeScript |
| Backend | **Node.js** + **Express 5** (API REST, puerto 3000) |
| Datos | **PostgreSQL** (Docker) + **Prisma 7** ORM |
| Autenticación | **Passkeys / WebAuthn** (`@simplewebauthn`) + cookie httpOnly firmada (HMAC-SHA256) |
| Chatbot IA | **LangChain** (`@langchain/core`, `@langchain/groq`, `@langchain/ollama`) con **RAG** (embeddings + vector store) |
| Integración externa | **Google Calendar** vía servidor **MCP** propio (JSON-RPC 2.0 sobre HTTP/SSE) |

### Diagrama de capas

```
┌─────────────────────────────────────────────────────────┐
│  Frontend — Next.js (http://localhost:3001)              │
│  App Router · Tailwind · ChatWidget · WebAuthn browser  │
└──────────────────────────┬──────────────────────────────┘
                           │ REST + cookie httpOnly
┌──────────────────────────▼──────────────────────────────┐
│  Backend — Express (http://localhost:3000)               │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────────┐ │
│  │ routes/  │→ │controllers/│→ │ services/ (lógica)   │ │
│  └──────────┘  └────────────┘  └────┬─────────┬───────┘ │
│                                     │         │         │
│  ┌──────────────────────┐   ┌───────▼───┐  ┌──▼───────┐ │
│  │ agent/ (LangChain)   │   │  Prisma   │  │ mcp/     │ │
│  │ RAG + tools + loop   │   │  Client   │  │ client   │ │
│  └──────────────────────┘   └───────┬───┘  └──┬───────┘ │
└─────────────────────────────────────┼──────────┼─────────┘
                              ┌───────▼───┐  ┌───▼──────────────┐
                              │ PostgreSQL│  │ Servidor MCP     │
                              │ (Docker)  │  │ Google Calendar  │
                              └───────────┘  │ (puerto 8000)    │
                                             └──────────────────┘
```

### Reglas de arquitectura (SDD)

- **Capa de servicios:** toda la lógica de negocio vive en `backend/src/services/`. Controllers y tools del chatbot delegan siempre en services.
- **MCP encapsulado:** ningún módulo fuera de `backend/src/mcp/` habla directamente con la API de Google. El backend actúa como **cliente MCP**; el servidor MCP de Calendar es un paquete autónomo.
- **El chatbot no es un camino alternativo:** las tools de LangChain reutilizan los mismos services que la API REST, por lo que las validaciones (solapes, bloqueos, notificaciones) son idénticas vía chat o vía formulario.

---

## Casos de uso (CU-01 → CU-10)

| CU | Caso de uso | Descripción | Implementación |
|----|-------------|-------------|----------------|
| **CU-01** | Autenticación con Passkeys | Registro y login sin contraseñas usando WebAuthn (dispositivo biométrico / llave de seguridad). Sesión persistida en cookie httpOnly firmada. | `backend/src/services/auth.service.js` · `/login`, `/registro` |
| **CU-02** | Catálogo de servicios | Listado público de servicios (nombre, duración, precio). CRUD completo con borrado lógico para administradores. | `backend/src/services/servicios.service.js` · `/servicios` |
| **CU-03** | Reserva de turnos | Wizard de 4 pasos (servicio → barbero → fecha/hora → confirmación). Valida disponibilidad, solapes, bloqueos y jornada laboral. | `backend/src/services/turnos.service.js` · `/reservar` |
| **CU-04** | Gestión de turnos (Cliente) | "Mis Turnos": próximos y historial, con cancelación y reprogramación propias. | `/mis-turnos` · `PATCH /api/turnos/:id/cancelar` |
| **CU-05** | Panel de Barberos | Agenda del día (y próximos 30 días), cambio de estado de turnos (`pendiente`, `confirmado`, `completado`, `ausente`, `cancelado`) y gestión de bloqueos. | `/panel` · `backend/src/services/barberos.service.js` |
| **CU-06** | Asistente Inteligente (Chatbot) | Chat en la esquina inferior de la UI. Agente **LangChain** con RAG sobre el catálogo y 4 tools (`consultar_disponibilidad`, `reservar_turno`, `consultar_mis_turnos`, `cancelar_turno`). | `backend/src/agent/` · `backend/src/services/asistente.service.js` |
| **CU-07** | Sincronización de Calendario (MCP) | Alta, baja y modificación de eventos en Google Calendar al crear/cancelar/reprogramar turnos, vía servidor MCP externo. Integración *opt-in*. | `backend/src/mcp/` · `backend/src/services/integraciones.service.js` · `/panel/configuracion` |
| **CU-08** | Gestión de Disponibilidad (Bloqueos) | Los barberos bloquean franjas (ausencias, almuerzo, etc.). Los bloqueos descontán de la disponibilidad y de la reserva. | `backend/src/services/barberos.service.js` · `BloqueosManager` en `/panel` |
| **CU-09** | Historial de Visitas | Ficha de cliente para staff: turnos pasados, total gastado, última visita y notas. Preferencias y endpoints `/me` pendientes. | `/panel/clientes` · `GET /api/clientes/:id/historial` |
| **CU-10** | Notificaciones de Estado | Notificaciones in-app al cliente y al barbero ante altas, cancelaciones y cambios de estado. Campanita en el navbar. | `backend/src/services/notificaciones.service.js` · `NotificationBell` |

> **Estado actual:** CU-01 a CU-05 completos; CU-06 a CU-10 parciales (ver deuda en [`ESTADO.md`](./ESTADO.md)); métricas y vista de clientes implementadas. Detalle por CU en [`ESTADO.md`](./ESTADO.md). Especificaciones técnicas completas en [`specs/`](./specs/).

---

## AI Engineering

El proyecto fue desarrollado aplicando ingeniería de software asistida por IA de forma **metodológica y trazable**:

### Metodología: Spec Kit (Spec-Driven Development)

Todo feature pasa por un pipeline con 4 gates obligatorios, definidos en [`.specify/memory/constitution.md`](./.specify/memory/constitution.md):

```
Requerimientos → Specs → Código → Testing
   (GATE 1)     (GATE 2)              (GATE 3/4)
```

1. **Requerimientos:** la especificación se escribe y aprueba **antes** de codificar.
2. **Specs:** cada feature tiene tres artefactos en [`specs/NNN-<feature>/`](./specs/) — `spec.md` (el "qué": historias, requisitos, criterios de aceptación), `plan.md` (el "cómo": endpoints, componentes, decisiones técnicas) y `tasks.md` (tareas atómicas y evidencia). Son 15 entradas de especificación: 13 de negocio/proyecto (arquitectura + CU-01 a CU-10 + métricas y vista de clientes), la mejora transversal 013 del pie de página y el incremento 014 de reinicio de chat vinculado a FR-008 de 006.
3. **Código:** la implementación respeta el contrato de la spec sin campos ni endpoints inventados.
4. **Testing / auditoría:** verificación contra los criterios de aceptación; el estado real se audita en [`ESTADO.md`](./ESTADO.md).

Reglas de corrección (ciclos de reintento): si un gate falla, se **detiene la codificación**, se vuelve a la spec, se corrige y recién entonces se reimplementa (ver `.specify/memory/constitution.md` y la tabla situación→acción de `.instructions.md`).

### Contexto para agentes de IA

| Archivo | Rol |
|---------|-----|
| [`AGENTS.md`](./AGENTS.md) | Define los 3 roles que asumen los agentes (Tech Lead, Backend, Frontend), sus responsabilidades, entregables y criterios de éxito. Establece el DoD (Definition of Done) y las reglas de coordinación entre roles. |
| [`.opencode/agents/`](./.opencode/agents/) | Versión nativa OpenCode de esos 3 roles: `arquitecto.md` (primary), `backend.md` y `frontend.md` (subagents). |
| [`.instructions.md`](./.instructions.md) | "Reglas de Oro": spec antes que código, stack fijo (LangChain + MCP), contratos primero, testing obligatorio, y la tabla de acciones ante situaciones de error (incluye el ciclo de autocorrección). |
| [`.specify/memory/constitution.md`](./.specify/memory/constitution.md) | Constitución del proyecto: principios rectores, los 4 gates del flujo, restricciones técnicas y roles con herencia. Es la autoridad metodológica. |
| [`specs/000-arquitectura/plan.md`](./specs/000-arquitectura/plan.md) | Spec maestra de arquitectura: capas, modelo de datos completo, árbol de carpetas y decisiones con trade-offs. |
| [`specs/NNN-<feature>/tasks.md`](./specs/) | Tracking de tareas por feature. Los 13 `tasks.md` de 000-012 fueron reconstruidos en el backfill documental del 26-oct-2026; `013-footer-anio` se creó antes de implementar. `[x]` solo indica evidencia verificable y `[ ]` deuda o verificación pendiente. |

### Prompts clave

Los prompts del asistente están centralizados en:

- **`backend/src/agent/prompts.js`** — `PROMPT_AGENTE` (system prompt con contexto RAG y catálogo vivo de servicios/barberos) y el template del RAG (`PROMPT_TEMPLATE`).
- **`backend/src/agent/tools.js`** — definición de las 4 tools (schema function-calling + ejecución delegada en services).
- **`backend/src/services/asistente.service.js`** — orquestación: retriever, construcción de mensajes y el **tool loop con autocorrección** (máximo 5 iteraciones de ejecución de tools + re-invocación del LLM).

### Iteración y evidencia

- Historial de tareas por feature: `specs/NNN-<feature>/tasks.md` (backfill 26-oct-2026 para 000-012; ciclos SDD 013 y 014; las verificaciones pendientes quedan en `[ ]`).
- Commits convencionales (`feat:`, `fix:`, `chore:`) trazables en el historial de git.
- Auditorías de estado fechadas en `ESTADO.md`.

---

## Model Context Protocol (MCP)

La integración con Google Calendar se hace **exclusivamente vía MCP**: el backend nunca llama a la API de Google directamente.

### Componentes

| Componente | Ubicación | Rol |
|------------|-----------|-----|
| Servidor MCP (externo) | `backend/src/mcp/google-calendar/` | Paquete autónomo (con su propio `package.json`). Expone 5 tools: `crearEvento`, `actualizarEvento`, `eliminarEvento`, `consultarEventos`, `verificarConexion`. |
| Cliente MCP | `backend/src/mcp/client.js` | Cliente JSON-RPC 2.0 sobre Streamable HTTP / SSE (protocolo `2024-11-05`), sin SDKs externos (usa el `fetch` nativo de Node 18+). |
| Adapter | `backend/src/mcp/google-calendar.js` | Envuelve las llamadas al cliente en funciones tipadas. |
| Servicio | `backend/src/services/integraciones.service.js` | Lógica de sincronización con resiliencia (un fallo de Calendar nunca bloquea la persistencia del turno). |

### Levantar el servidor MCP de Google Calendar

```bash
# 1. Colocar las credenciales de la cuenta de servicio de Google
#    en: backend/src/mcp/google-calendar/google-credentials.json
#    (formato service_account; el archivo está en .gitignore)

# 2. Instalar dependencias del paquete autónomo
cd backend/src/mcp/google-calendar
npm install

# 3. Levantar el servidor (puerto 8000 por defecto)
npm start
```

El servidor queda disponible en `http://localhost:8000` con:

- `POST /mcp` — transporte Streamable HTTP (JSON-RPC)
- `POST /sse` — handshake SSE clásico
- `GET /health` — health check

### Configurar el backend como cliente MCP

En `backend/.env`:

```env
# URL del servidor MCP. Vacío = integración deshabilitada (opt-in).
MCP_CALENDAR_URL=http://localhost:8000/mcp
# Token Bearer opcional para autenticar contra el servidor MCP.
MCP_CALENDAR_TOKEN=
# Calendario destino (alias aceptado: CALENDAR_ID).
MCP_CALENDAR_ID=primary
# Timeout por llamada MCP (ms)
MCP_CALENDAR_TIMEOUT_MS=5000
# Zona horaria de los eventos
TIMEZONE=America/Argentina/Buenos_Aires
```

> **Opt-in:** si `MCP_CALENDAR_URL` está vacío, la integración queda deshabilitada y los turnos se persisten normalmente con `googleEventId = null` (estado "pendiente"). El estado de la conexión se puede ver y reconectar desde **Panel → Configuración** (`/panel/configuracion`).

---

## Instalación y ejecución

### Requisitos

- Node.js 18+ (recomendado 20 LTS)
- Docker (para PostgreSQL)
- npm
- (Opcional) Groq API key para el chatbot en la nube, o [Ollama](https://ollama.com) instalado para correrlo local

### Paso 1 — Base de datos (PostgreSQL en Docker)

La base de datos está incluida en `docker-compose.yml` como el servicio `postgres` (imagen `postgres:16-alpine`, puerto `5432`, volumen `postgres_data`). Para el flujo nativo (backend/frontend con `npm run dev`) alcanza con levantar solo ese servicio:

```bash
docker compose up -d postgres
```

Credenciales por defecto: usuario `usuario`, contraseña `password`, base `barberia`. Si ya tenías un contenedor `barberia-postgres` creado con `docker run`, eliminalo antes para evitar conflictos de puerto y de nombre.

### Paso 2 — Backend

```bash
cd backend
npm install

# Crear el archivo de entorno a partir del ejemplo
cp .env.example .env
# Editar .env: SESSION_SECRET (uno largo y aleatorio) y GROQ_API_KEY

# Generar el cliente Prisma y aplicar migraciones
npx prisma migrate dev

# Cargar datos iniciales (4 servicios + 2 barberos)
npm run seed

# Construir la base vectorial del chatbot (RAG) desde datos_barberia.md
npm run ingest

# Levantar el backend en http://localhost:3000
npm run dev
```

### Paso 3 — Frontend

```bash
cd frontend
npm install

# Levantar Next.js en http://localhost:3001
npm run dev
```

Abrí **http://localhost:3001**, registrá un usuario con Passkey y ya podés reservar.

### Alternativa — Entorno de desarrollo con Docker Compose

Si preferís no ejecutar `npm run dev` en dos terminales, el repositorio incluye un `docker-compose.yml` con PostgreSQL, frontend y backend en contenedores y recarga en vivo.

```bash
# Desde la raíz del proyecto, con Docker Desktop iniciado
docker compose up -d --build
```

El backend espera a que PostgreSQL esté saludable (`healthcheck` con `pg_isready`) antes de arrancar.

| Servicio | URL | Puerto |
|:---------|:----|:-------|
| Frontend (Next.js) | http://localhost:3001 | `3001:3001` |
| Backend (Express) | http://localhost:3000/api/health | `3000:3000` |
| PostgreSQL | `localhost:5432` | `5432:5432` |

- El código se monta desde `./frontend` y `./backend`, por lo que los cambios se reflejan sin reconstruir la imagen.
- `node_modules` y `.next` viven en volúmenes propios para no mezclar binarios de Windows con los de Linux.
- El backend recibe `DATABASE_URL=postgresql://usuario:password@postgres:5432/barberia?schema=public` desde el compose y resuelve la base por el nombre del servicio (`postgres`). `backend/.env` sigue usándose para el flujo nativo, donde la base se alcanza en `localhost:5432`.
- Si cambiás las credenciales de PostgreSQL, actualizá a la vez el servicio `postgres` y el `DATABASE_URL` del backend en `docker-compose.yml`.
- En el primer arranque, aplicá las migraciones y cargá los datos iniciales:

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed
```

Variables opcionales: `NEXT_PUBLIC_API_URL`, `MCP_CALENDAR_URL_DOCKER` y `OLLAMA_BASE_URL_DOCKER` (por defecto apuntan a `host.docker.internal` para servicios que corren en el host).

```bash
# Ver logs
docker compose logs -f postgres backend frontend

# Detener el entorno (conserva los volúmenes de dependencias)
docker compose down

# Detener y borrar los volúmenes (fuerza reinstalar dependencias la próxima vez)
docker compose down -v
```

> Si el hot-reload no dispara en Windows, los watchers ya usan polling (`WATCHPACK_POLLING` y `CHOKIDAR_USEPOLLING`). Verificá que el proyecto esté en una ruta compartida con Docker Desktop y que los puertos `3000`/`3001` no estén ocupados por procesos locales.

### Paso 4 (opcional) — Servidor MCP de Google Calendar

Ver [Model Context Protocol (MCP)](#levantar-el-servidor-mcp-de-google-calendar).

### Paso 5 (opcional) — Crear un administrador

El seed crea el usuario administrador `admin@barberia.com`, servicios y barberos. Si querés ascender un **usuario propio** ya registrado a `admin` (creándole además el perfil de barbero):

```bash
cd backend
npx tsx scripts/make-admin.ts   # editar el email dentro del archivo antes de ejecutar
```

Esto asciende el usuario a `admin` y crea su perfil de barbero operativo si no existe.

---


### Primer inicio de sesión con usuario Admin

El seed (`backend/prisma/seed.js`) crea un usuario administrador con email `admin@barberia.com`. Este usuario no tiene una Passkey registrada inicialmente.

Para enrolar tu propia passkey y poder iniciar sesión:

1. Asegúrate de tener el backend y frontend en ejecución.
2. Abre el frontend (por defecto `http://localhost:3001`) y accede a la pantalla de registro/login.
3. Regístrate con el email exacto: `admin@barberia.com` (junto con tu nombre y teléfono si se solicita).
4. El sistema permitirá registrar la passkey aunque el usuario ya exista en la base de datos, siempre que no tenga credenciales previas asociadas. De este modo, tu passkey quedará asociada al usuario admin existente.
5. Una vez registrada la passkey, puedes iniciar sesión con `admin@barberia.com` usando esa passkey.

> Nota: si ya existe una passkey para ese email, el registro fallará con "El email ya está registrado".

### Tests

Los tests unitarios utilizan el **Node.js Test Runner** nativo (sin dependencias externas):

```bash
cd backend
npm test
```

Actualmente la suite incluye 8 tests: 4 de autenticación (`auth.test.js`) y 4 de turnos (`turnos.test.js`), entre ellos la autorización por propietario y la prevención de IDOR horizontal. No hay tests de controllers, middlewares, agente, integraciones ni frontend (ver deuda en `ESTADO.md`).


## Variables de entorno

Archivo `backend/.env` (ver `backend/.env.example`):

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `SESSION_SECRET` | Secreto para firmar la cookie de sesión (HMAC-SHA256). **Obligatorio y aleatorio.** |
| `WEBAUTHN_RP_ID` / `WEBAUTHN_RP_NAME` / `WEBAUTHN_ORIGIN` | Parámetros WebAuthn (RP ID = hostname, Origin = URL del frontend) |
| `CORS_ORIGIN` | Lista blanca de orígenes permitidos (separados por coma). Si se omite, solo se permite `localhost:3000` y `localhost:3001` |
| `VENTANA_CANCELACION_HORAS` | Ventana mínima para cancelar (0 = sin límite) |
| `LLM_PROVIDER` | `groq` (nube) u `ollama` (local) |
| `LLM_MODEL` | Modelo a usar (ej. `qwen/qwen3.8-27b` en Groq) |
| `GROQ_API_KEY` | API key de Groq (si `LLM_PROVIDER=groq`) |
| `OLLAMA_BASE_URL` | URL de Ollama (si `LLM_PROVIDER=ollama`) |
| `ASISTENTE_TOP_K` | Cantidad de fragmentos del RAG a inyectar (default 4) |
| `ASISTENTE_DOC` | Documento fuente del RAG (default `../datos_barberia.md`) |
| `MCP_CALENDAR_URL` / `MCP_CALENDAR_TOKEN` / `MCP_CALENDAR_ID` / `MCP_CALENDAR_TIMEOUT_MS` | Conexión al servidor MCP de Calendar (ver sección MCP) |
| `TIMEZONE` | Zona horaria de los eventos (default `America/Argentina/Buenos_Aires`) |

## Despliegue en Vercel

La configuración raíz [`vercel.json`](./vercel.json) define tres servicios. En los ajustes del proyecto de Vercel, el **Root Directory debe ser la raíz del repositorio (`.`)**, donde está este archivo; no lo cambies a `frontend` ni `backend`. Cada servicio fija su propio `root` y ejecuta `npm ci` contra su lockfile:

| Servicio | Acceso | Función |
|----------|--------|---------|
| `frontend` (`frontend/`) | Público en `/` | Aplicación Next.js; `npm ci` usa `frontend/package-lock.json` |
| `backend` (`backend/`) | Público bajo `/api/*` | API REST Express; `npm ci` usa `backend/package-lock.json` y Prisma Client se genera durante el build |
| `calendar-mcp` (`backend/src/mcp/google-calendar/`) | Interno | Servidor MCP; `npm ci` usa su lockfile independiente y el backend lo invoca mediante `CALENDAR_MCP_URL` |

El cliente web usa `/api` en producción para que Vercel enrute las solicitudes al backend en el mismo dominio. En desarrollo sigue usando `http://localhost:3000`, salvo que se configure `NEXT_PUBLIC_API_URL`. No definas `NEXT_PUBLIC_API_URL` en Vercel: anularía el enrutamiento same-origin.

Los tres servicios fijan Node.js `24.x` mediante sus respectivos `package.json`. No hay un paquete npm en la raíz: frontend, backend y Calendar MCP son instalaciones independientes; `chatbot-rag/` es un prototipo Python y no se despliega como servicio Node.

`chatbot-rag/` no se despliega como servicio: es un prototipo Python de consola. El asistente productivo forma parte del backend. PostgreSQL también debe ser provisto externamente; no se agrega como servicio Vercel.

Configurar en Vercel las variables de entorno requeridas para el backend: `DATABASE_URL`, `SESSION_SECRET`, `WEBAUTHN_RP_ID` y `WEBAUTHN_ORIGIN` para el dominio final. Para las funciones opcionales, agregar `GROQ_API_KEY` y `GOOGLE_CREDENTIALS_JSON` (JSON de credenciales de Calendar), además de `CALENDAR_ID` y `TIMEZONE` cuando corresponda. `CALENDAR_MCP_URL` es inyectada por el binding y no debe configurarse manualmente; localmente puede seguir usándose `MCP_CALENDAR_URL`.

El backend mantiene LangChain.js `0.3.x` y `zod@3.25.76`; `dotenv@16.6.1` satisface el peer de Stagehand requerido por `@langchain/community@0.3.59`. Stagehand no se usa directamente, pero npm lo instala como peer obligatorio de esa versión de Community. No se usa `legacy-peer-deps`: las dependencias deben resolver con las restricciones declaradas.

El historial nuevo del chatbot se guarda en PostgreSQL mediante Prisma y `DATABASE_URL`, por lo que no depende del filesystem efímero de Vercel. Aplicá las migraciones (`npx prisma migrate deploy`) a la base configurada antes de habilitar tráfico; el build solo genera Prisma Client y no modifica la base. Los archivos JSON locales de conversaciones anteriores no se importan automáticamente.

---

## Estructura del proyecto

```
Proyecto_Barberia/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express: middleware, CORS, rutas
│   │   ├── routes/                 # Definición de endpoints (/api/*)
│   │   ├── controllers/            # Validación de entrada y mapeo de errores
│   │   ├── services/               # Lógica de negocio (fuente de verdad)
│   │   ├── middlewares/            # auth.middleware.js (requiereAuth, requiereRol)
│   │   ├── agent/                  # Chatbot LangChain
│   │   │   ├── llm.js              # Instancia del LLM (Groq / Ollama)
│   │   │   ├── prompts.js          # System prompt + template RAG
│   │   │   ├── tools.js            # 4 tools (disponibilidad, reservar, etc.)
│   │   │   ├── vectorStore.js      # MemoryVectorStore + auto-ingest
│   │   │   ├── embeddings.js       # HuggingFace all-MiniLM-L6-v2
│   │   │   └── conversations.js    # Persistencia de sesiones de chat
│   │   ├── mcp/                    # Capa MCP (encapsulada)
│   │   │   ├── client.js           # Cliente JSON-RPC 2.0 (fetch nativo)
│   │   │   ├── google-calendar.js  # Adapter de las 5 tools
│   │   │   ├── google-calendar/    # Servidor MCP externo (paquete autónomo)
│   │   │   └── postgres/           # Servidor MCP local (stdio, solo lectura)
│   │   ├── config/                 # env.js, prisma.js
│   │   └── utils/                  # session.js, challengeStore.js
│   ├── prisma/
│   │   ├── schema.prisma           # Modelo de datos
│   │   ├── migrations/             # Migraciones SQL versionadas
│   │   └── seed.js                 # Datos iniciales
│   ├── scripts/
│   │   ├── ingest.js               # Construcción del índice vectorial
│   │   └── make-admin.ts           # Ascenso de un usuario a administrador
├── frontend/
│   └── src/
│       ├── app/                    # App Router (login, reservar, panel, etc.)
│       ├── components/             # UI (auth, turnos, chat, panel, layout)
│       └── lib/                    # Cliente API + hooks
├── chatbot-rag/                    # Prototipo Python del asistente RAG (standalone)
│   ├── ingest.py                   # MD → chunks → embeddings → ChromaDB
│   ├── chat.py                     # Chat RAG por consola
│   └── requirements.txt            # Dependencias Python del prototipo
├── specs/                          # Especificaciones Spec Kit
│   ├── index.md                    # Mapa maestro de specs
│   ├── 000-arquitectura/           # Spec + plan + tasks de arquitectura maestra
│   └── NNN-<feature>/              # spec.md (qué) + plan.md (cómo) + tasks.md por feature
├── .specify/                       # Spec Kit: constitución, templates, scripts
├── .opencode/                      # Configuración nativa de OpenCode
│   ├── agents/                     # Roles de la IA (Tech Lead, Backend, Frontend)
│   ├── commands/                   # Comandos slash de Spec Kit
│   └── skills/                     # Skills propios del proyecto
├── opencode.json                   # MCPs del proyecto (Postgres local + Calendar)
├── AGENTS.md                       # Roles de los agentes de IA
├── .instructions.md                # Reglas de oro del proyecto
├── ESTADO.md                       # Auditoría de estado por feature
└── datos_barberia.md               # Documento fuente del RAG
```

---

## Tooling de IA (OpenCode)

El proyecto está inicializado como entorno nativo de **OpenCode**:

```
opencode.json          # MCPs del proyecto + instrucciones ambientales
.specify/              # Spec Kit: constitución, templates, scripts, workflows
├── memory/constitution.md           # Principios rectores y gates del flujo
└── templates/                       # Templates de spec, plan, tasks, checklist
.opencode/
├── agents/            # arquitecto.md · backend.md · frontend.md
├── commands/          # Comandos slash de Spec Kit (/speckit.specify, .plan, …)
└── skills/
    ├── sdd-workflow/SKILL.md          # Pipeline Spec Kit con gates
    ├── barberia-domain/SKILL.md       # Reglas de negocio e invariantes
    └── proyecto-convenciones/SKILL.md # Naming, commits, estructura
```

### Comandos Spec Kit

El proyecto usa **GitHub Spec Kit** como metodología SDD. Los comandos se invocan desde el chat:

| Comando | Uso |
|---------|-----|
| `/speckit.constitution` | Principios rectores del proyecto |
| `/speckit.specify` | Crear la spec de una feature (el "qué") |
| `/speckit.plan` | Generar el plan técnico (el "cómo") |
| `/speckit.tasks` | Descomponer en tareas accionables |
| `/speckit.implement` | Ejecutar la implementación |
| `/speckit.clarify` · `/speckit.analyze` · `/speckit.checklist` | Comandos de calidad |

### Servidores MCP configurados

| MCP | Tipo | Levantado por | Detalle |
|-----|------|---------------|---------|
| `postgres-local` | local (stdio) | OpenCode | Inspección de esquema en **solo lectura**. Requiere `DATABASE_URL` en `backend/.env`. |
| `google-calendar` | remote (HTTP) | **Manual** | `cd backend && npm run mcp:calendar` → `http://localhost:8000/mcp` |

> ⚠️ **El MCP de Google Calendar no arranca solo.** Si aparece en timeout, el proceso en `localhost:8000` no está corriendo — no es un bug del código. Levantalo con `cd backend && npm run mcp:calendar` (requiere `google-credentials.json` y, la primera vez, `npm run mcp:calendar:install`).

> ⚠️ **Reiniciar OpenCode** después de cambios en `opencode.json`, agentes o skills: la configuración se carga una sola vez al arrancar y no se recarga en caliente.

---

## Modelo de datos

PostgreSQL vía Prisma (`backend/prisma/schema.prisma`):

| Modelo | Descripción |
|--------|-------------|
| `Usuario` | Cuenta con email y rol (`cliente` / `barbero` / `admin`) |
| `CredencialPasskey` | Credenciales WebAuthn asociadas al usuario (credential ID, counter) |
| `Barbero` | Perfil operativo: especialidad, días laborales, horario. Relación 1:1 con `Usuario` |
| `Servicio` | Catálogo: nombre, descripción, duración, precio. Borrado lógico vía `activo` |
| `Turno` | Reserva: fecha/hora, estado (`pendiente`, `confirmado`, `completado`, `cancelado`, `ausente`), `notas`, `googleEventId` para la sync de Calendar |
| `Bloqueo` | Ausencia/franja bloqueada de un barbero (CU-08) |
| `Notificacion` | Notificación in-app dirigida a un usuario (CU-10) |

---

## Seguridad

- **Autenticación sin contraseñas:** Passkeys (WebAuthn) con challenge de un solo uso y TTL de 5 minutos.
- **Sesión:** cookie `httpOnly` + `sameSite=lax` (y `secure` en producción) con token firmado HMAC-SHA256 (`crypto.timingSafeEqual`).
- **RBAC:** `requiereAuth` y `requiereRol('admin')` en rutas sensibles (métricas, integraciones, CRUD de servicios). El cliente solo ve y cancela **sus propios turnos** (ownership verificado en service).
- **Convención de autorización sobre turnos (prevención de IDOR horizontal):** la autorización se centraliza en `verificarPropietario()` (`backend/src/services/turnos.service.js`) y se aplica a cancelar/reprogramar. La política es: **admin** gestiona cualquier turno; el **cliente** solo los propios (`turno.clienteId === usuario.id`); el **barbero** solo los asignados a él. Importante: `turno.barberoId` es FK a `barbero.id`, **no** a `usuario.id`, por lo que la pertenencia del barbero se resuelve con `prisma.barbero.findUnique({ where: { usuarioId } })` y se compara `barbero.id === turno.barberoId`. Cualquier acceso fuera de la política devuelve **403 Forbidden**.
- **El rol se resuelve desde la base de datos** en cada request; un rol alterado en el cookie no tiene efecto.
- **Aislamiento de conversaciones:** el historial del chat valida propiedad por usuario (403 si la conversación es ajena); los ids se validan como UUID antes de consultar PostgreSQL y el borrado se restringe por id y propietario.
- **CORS:** lista blanca explícita de orígenes (`CORS_ORIGIN`); nunca se refleja cualquier origen con credenciales.
- **`SESSION_SECRET` en producción:** obligatoria. Con `NODE_ENV=production` y sin secreto, la aplicación **no arranca** (evita sesiones forjables). En desarrollo se usa un fallback con advertencia.

---

## Licencia

Proyecto académico — Materia "Desarrollo de Software y Arquitectura de Agentes con IA".
