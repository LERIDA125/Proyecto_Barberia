# Feature: fix-filtros-estado-chat

- Branch: `feature/clientes` (current; no new branch)
- Delivery strategy: `exception-ok` — fixes in place, no PR slicing
- Base: `60d6051`

## Goal

Fix three filtering/state bugs without modifying the rest of the architecture (Feature Freeze):

1. **Admin panel** (`GET /api/barberos/me/agenda`, "Agenda de hoy" + KPI summary on `/panel`):
   exclude `cancelado` turnos from the query, and compute the default "today" range in
   `America/Argentina/Buenos_Aires` instead of server-local time.
2. **`Mis Turnos` (client)**: a turno moves to Historial only when `estado === 'completado'`
   or its date already passed.
3. **`ChatWidget` (frontend)**: persist the current conversation id in `localStorage` and
   restore the history on mount via `GET /api/asistente/historial`.

## Tasks

- [x] **T1 — Backend: estado filter + timezone** (`backend/src/services/barberos.service.js`)
  - `agendaBarbero`: add `estado: { not: 'cancelado' }` to the Prisma `where`.
  - `rangoFechas`: default "today" computed in `America/Argentina/Buenos_Aires` using
    `Intl.DateTimeFormat` + fixed `-03:00` offset. Explicit `desde`/`hasta` behavior unchanged.
  - Checks: `node --check src/services/barberos.service.js` → PASS (exit 0).
- [x] **T2 — Frontend: Próximos/Historial** (`frontend/src/app/mis-turnos/page.tsx`)
  - Historial = `estado === 'completado' || !esFuturo(fechaInicio)`; Próximos = the rest.
  - Checks: `npx tsc --noEmit` → PASS (exit 0); `npx eslint .../mis-turnos/page.tsx` → 0 errors
    (2 pre-existing warnings `Card`/`EmptyState`, already present at HEAD).
- [x] **T3 — Frontend: chat persistence** (`frontend/src/components/chat/ChatWidget.tsx`,
  `frontend/src/types/api.ts`)
  - Persist `conversacionId` scoped by `usuario.id`; restore history on mount.
  - Checks: `npx tsc --noEmit` → PASS (exit 0); `npx eslint src/components/chat/ChatWidget.tsx
    src/types/api.ts` → 0 errors.

## Authorized edit surfaces

- `backend/src/services/barberos.service.js`
- `frontend/src/app/mis-turnos/page.tsx`
- `frontend/src/components/chat/ChatWidget.tsx`
- `frontend/src/types/api.ts`

## Route decisions

- T1/T2/T3 → **delegated direct** (single bounded writer): implementation touches 4
  non-trivial files across backend, frontend, and shared types → writer trigger.
- **No commits**: `.instructions.md` rule #8 forbids commit/push/PR without explicit user
  authorization. Work-unit commits are intentionally skipped for this request.

## Progress

- 2026-10-12 — T1/T2/T3 implemented by one bounded writer (`gentle-ai-worker`); all
  checks green (re-confirmed by parent spot check):
  - backend `node --check` → exit 0
  - frontend `npx tsc --noEmit` → exit 0
  - frontend `npx eslint` (3 files) → 0 errors, 2 pre-existing warnings
- No test infrastructure exists in the repo (no test scripts), so verification is static:
  syntax check + type check + lint.
- **No commits** (`.instructions.md` rule #8). Changes remain unstaged in the worktree.
- RDD review: switch is `on` (global), but the runtime returned
  `immutable_review_transport_unsupported` — this runtime cannot provide the immutable
  receipt-review transport, so the native review could not run. Delivery is unmanaged,
  pending user decision.
- Next step: user reviews the diff and decides commit/push (rule #8 requires explicit
  authorization).
