---
name: proyecto-convenciones
description: Use when writing code, committing, or configuring tooling in this repository — includes commit format, naming conventions, folder layout, environment variables, and the MCP setup. Load before any implementation or commit.
---

# Convenciones del Proyecto

Reglas de forma y operación. Cargalas antes de escribir código o commitear.

## Estructura del repositorio

```
Proyecto_Barberia/
├── backend/                 # Node.js + Express + Prisma
│   ├── src/
│   │   ├── services/        # TODA la lógica de negocio
│   │   ├── controllers/     # Delegación a services
│   │   ├── routes/          # Definición de endpoints
│   │   ├── agent/           # LangChain: tools.js, prompts.js
│   │   └── mcp/             # Cliente MCP + servidores MCP
│   ├── prisma/              # schema.prisma + migrations
│   └── scripts/ingest.js    # Construcción del índice vectorial (RAG)
├── frontend/                # Next.js (App Router) + Tailwind
│   └── src/
│       ├── app/             # Rutas
│       ├── components/      # UI por dominio (auth, turnos, chat, panel, layout)
│       └── lib/             # api/ y hooks/
├── specs/                   # Especificaciones SDD + SDD.md + index.md
├── odd/tasks/               # Tracking de ejecución por feature
├── .opencode/               # Configuración nativa de OpenCode (agents, skills)
└── opencode.json            # MCPs del proyecto
```

## Naming (código)

- **Español** para términos del dominio: `turnos`, `barberos`, `bloqueos`, `servicios`, `clientes`.
- **Inglés** para conceptos técnicos genéricos: `controller`, `service`, `route`, `middleware`.
- **Archivos:** `kebab-case` con sufijo de rol → `turnos.service.js`, `auth.routes.js`, `barberos.controller.js`.
- **Componentes React:** `PascalCase` → `TurnoPanelCard.tsx`, `NotificationBell.tsx`.
- **Hooks:** `use` + PascalCase → `useMiAgenda.ts`, `useClientes.ts`.
- **Funciones/variables:** `camelCase`. Tablas y columnas en Prisma: `snake_case` en DB, `camelCase` en modelo.

## Commits

**Conventional Commits, en español o inglés, sin atribución de IA.**

```
feat(turnos): agregar validación de solape en reprogramación
fix(auth): corregir expiración de sesión en cookie httpOnly
chore(mcp): actualizar dependencias del servidor de Calendar
```

Reglas duras:
- **NUNCA** agregues `Co-Authored-By` ni atribución a IA.
- Un commit = una unidad de trabajo revisable.
- Tests y docs van **junto** al cambio de comportamiento, no en un commit posterior.

Tipos: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`.

## Variables de entorno

- **Raíz `.env`**: config del asistente (`LLM_PROVIDER`, `LLM_MODEL`, `GROQ_API_KEY`).
- **`backend/.env`**: config del backend (`DATABASE_URL`, `SESSION_SECRET`, `WEBAUTHN_*`, `MCP_CALENDAR_*`).
- **Nunca** hardcodees secretos, tokens ni URLs de base de datos.
- **Nunca** commitees `.env`, `google-credentials.json` ni `backend/data/`.

## Testing

- Runner del backend: `node --test` → `cd backend; npm test`.
- Cada endpoint nuevo: **un test de caso feliz y un test de caso de error**.
- Estado actual: 0 tests en el repo — es deuda técnica conocida, afecta el DoD de todos los CU.

## MCPs disponibles

| MCP | Tipo | Cómo se levanta |
|-----|------|-----------------|
| `postgres-local` | local (stdio) | OpenCode lo arranca solo desde `backend/` |
| `google-calendar` | remote (HTTP) | **Manual:** `cd backend; npm run mcp:calendar` → `localhost:8000` |

**El MCP de Calendar no arranca solo.** Si el MCP aparece en timeout, el proceso en `localhost:8000` no está corriendo — eso no es un bug del código.

## Reglas de oro del proyecto

1. Spec antes que código.
2. Stack fijo: LangChain + MCP. No se cambia por preferencia.
3. Contratos primero: se respeta la spec sin inventar campos.
4. Testing obligatorio (ver DoD).
5. Un rol por turno — declaralo al inicio del trabajo.

Detalle completo en `.instructions.md` y `.specify/memory/constitution.md`.
