# Feature: vista-clientes

- Branch: `feature/clientes` (base: tip of `feature/metricas`)
- Spec: `specs/spec-vista-clientes.md`
- Delivery strategy: `ask-on-risk` — forecast ~300 authored lines

## Goal
Panel cliente view lists ALL clients, filters/sorts client-side, and shows per-client value (traffic + total spend) in the ficha.

## Tasks

- [ ] **T1 — Backend**: new `GET /api/clientes` (list all, `_count.turnos`, orderBy nombre) + `resumen` in `GET /api/clientes/:id/historial`.
  - Files (edits): `backend/src/services/clientes.service.js`, `backend/src/controllers/clientes.controller.js`, `backend/src/routes/clientes.routes.js`.
  - Route: inline → **delegated** (writer; 3 files).
  - Checks: `node --check` on the 3 edited files.
- [ ] **T2 — Frontend**: full list + client-side filter/sort + resumen in FichaCliente.
  - Files: `frontend/src/types/api.ts`, `frontend/src/lib/api/clientes.ts`, new `frontend/src/lib/hooks/useClientes.ts`, `frontend/src/app/panel/clientes/page.tsx`, `frontend/src/components/panel/FichaCliente.tsx`.
  - Route: inline → **delegated** (writer; 5 files).
  - Checks: `npx tsc --noEmit` + `npx eslint` on the 5 changed files.
- [ ] **T3 — Verify + commits** (branch `feature/clientes`).
  - Two work-unit commits: `feat(backend): listado y resumen de clientes` and `feat(frontend): vista de clientes con listado, filtro y resumen`.
  - Then `gentle-ai review assess` per commit; follow `next_transition` (consent wall expected → report).

## Authorized edit surfaces
- `backend/src/services/clientes.service.js`
- `backend/src/controllers/clientes.controller.js`
- `backend/src/routes/clientes.routes.js`
- `frontend/src/types/api.ts`
- `frontend/src/lib/api/clientes.ts`
- `frontend/src/lib/hooks/useClientes.ts`
- `frontend/src/app/panel/clientes/page.tsx`
- `frontend/src/components/panel/FichaCliente.tsx`

## Progress
- Created: 09-S. T1/T2 pending.