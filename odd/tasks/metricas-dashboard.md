# Feature: metricas-dashboard

- Branch: `feature/metricas` (base: tip of `feature/panel-admin`)
- Spec: `specs/spec-metricas-dashboard.md`
- Delivery strategy: `ask-on-risk` — forecast ~380 authored lines

## Goal
Admin-only global business metrics: ingresos, ocupación de agenda, top servicios, in an optional date range.

## Tasks

- [ ] **T1 — Backend endpoint** `GET /api/metricas` (admin-only).
  - Files: new `backend/src/services/metricas.service.js`, new `backend/src/controllers/metricas.controller.js`, new `backend/src/routes/metricas.routes.js`, edit `backend/src/routes/index.js` (register `/metricas`).
  - Route: inline → **delegated** (writer; mapping trigger: whole-service family new).
  - Checks: `node --check` on the 3 new files.
- [ ] **T2 — Frontend page** `/panel/metricas` + nav.
  - Files: `frontend/src/types/api.ts` (Metricas types), new `frontend/src/lib/api/metricas.ts`, new `frontend/src/lib/hooks/useMetricas.ts`, new `frontend/src/app/panel/metricas/page.tsx`, edit `frontend/src/app/panel/page.tsx` (navItems "Métricas" admin-only).
  - Route: inline → **delegated** (writer; write trigger: 4+ files).
  - Checks: `npx tsc --noEmit` + `npx eslint` on the 5 changed frontend files.
- [x] **T3 — Verify + commits** (branch `feature/metricas`).
  - Two work-unit commits: `feat(backend): endpoint de métricas globales` and `feat(frontend): dashboard de métricas`.
  - Then `gentle-ai review assess` per commit; follow `next_transition` (consent wall expected in this runtime → report).

## Authorized edit surfaces
- `backend/src/services/metricas.service.js`
- `backend/src/controllers/metricas.controller.js`
- `backend/src/routes/metricas.routes.js`
- `backend/src/routes/index.js`
- `frontend/src/types/api.ts`
- `frontend/src/lib/api/metricas.ts`
- `frontend/src/lib/hooks/useMetricas.ts`
- `frontend/src/app/panel/metricas/page.tsx`
- `frontend/src/app/panel/page.tsx`

## Progress
- T1 ✅ delegated writer; node --check ×4 verde + spot check padre verde.
- T2 ✅ delegated writer; tsc + eslint scoped verdes + spot check padre verde.
- T3 ✅ **Cerrado por aprobación humana explícita (2026-10-13).** El usuario aprobó cerrar el slice salteando la revisión nativa: el lifecycle RDD no es ingresable en este runtime (`immutable_review_transport_unsupported`), y el envelope `consent/v3` quedó sin resolución nativa. No quedó acción pendiente; el slice quedó contenido en `feature/clientes` (downstream de `feature/metricas`).
- Commits del slice: `1fcabb3` (backend+spec+tracking) y `96d80fd` (frontend) — 646 líneas.
- RDD histórico: assess → `high` (unassessable por untracked) → reevaluado `medium` / `slice_budget_reached` (740 líneas) → preflight STATUS → collect → START `--consent=relay` → consent/v3 pendiente hasta la aprobación humana del 13-oct.