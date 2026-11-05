# Implementation Plan: Dashboard de Métricas de Negocio

**Branch**: `011-metricas-dashboard` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-metricas-dashboard/spec.md`

**Estado:** aprobada (09-S). Alcance: admin-only. Frontend: panel `/panel/metricas`.

## Summary

Endpoint de métricas globales admin-only con rango de fechas, y panel `/panel/metricas` con cards de ingresos, ocupación, turnos por estado y ranking de servicios más pedidos. No modifica `GET /api/barberos/me/metricas`.

## Endpoint REST (Node.js)

`GET /api/metricas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`

- Auth: `requiereAuth` + `requiereRol('admin')`. Cualquier otro rol → 403.
- Semántica de rango igual a `rangoFechas` de `barberos.service.js`: `desde`/`hasta` opcionales → hoy por defecto; `hasta` inclusive hasta las 23:59:59.999; `desde > hasta` → 400.

### Respuesta 200

```json
{
  "desde": "2026-10-01T00:00:00.000Z",
  "hasta": "2026-10-31T23:59:59.999Z",
  "turnos": {
    "total": 12,
    "porEstado": { "pendiente": 1, "confirmado": 2, "completado": 6, "cancelado": 2, "ausente": 1 }
  },
  "ingresos": { "completados": 6, "monto": 78000 },
  "ocupacion": { "turnos": 10, "horasOcupadas": 9.5, "horasDisponibles": 160, "porcentaje": 5.9 },
  "serviciosMasPedidos": [
    { "servicioId": "uuid", "nombre": "Corte", "cantidad": 4, "ingresos": 32000 }
  ]
}
```

## Reglas de cálculo

- `turnos.porEstado`: conteo por `estado` de turnos con `fechaInicio` en el rango; `total` = suma.
- `ingresos.monto`: Σ `servicio.precio` (convertido a `Number`) de turnos `completado` en el rango; `ingresos.completados` = cantidad de esos turnos. Solo `completado` cuenta como ingreso.
- `ocupacion.turnos`: cantidad de turnos con estado en `[pendiente, confirmado, completado, ausente]`.
- `ocupacion.horasOcupadas`: Σ `(fechaFin − fechaInicio)` en ms ÷ 3.600.000 de esos mismos turnos.
- `ocupacion.horasDisponibles`: Σ por barbero **activo** (`activo: true`) de las horas laborables por día (día ∈ `diasLaborales`), iterando cada día del rango inclusive; usar `getUTCHours` de `horarioInicio`/`horarioFin` (convención existente del repo).
- `ocupacion.porcentaje`: `horasDisponibles > 0 ? horasOcupadas / horasDisponibles * 100 : 0`, redondeado a 1 decimal.
- `serviciosMasPedidos`: top 5 por `cantidad` de turnos con estado ≠ `cancelado`, agrupados por `servicioId`; `ingresos` = Σ precio solo de `completado`; orden desc por cantidad, empate alfabético por nombre.

## Archivos backend

- nuevo `backend/src/services/metricas.service.js` (helper local `rangoFechas` espejo de semántica, sin acoplar a barberos.service)
- nuevo `backend/src/controllers/metricas.controller.js`
- nuevo `backend/src/routes/metricas.routes.js`
- editar `backend/src/routes/index.js` → `router.use('/metricas', metricasRoutes)`

## Frontend

- `frontend/src/types/api.ts`: interfaces `Metricas`, `MetricasIngresos`, `MetricasOcupacion`, `MetricasServicio` (o un solo tipo anidado).
- nuevo `frontend/src/lib/api/metricas.ts`: `getMetricas(params: { desde?: string; hasta?: string })`.
- nuevo `frontend/src/lib/hooks/useMetricas.ts`: patrón `firma` de `useTurnos`; recibe rango y `habilitado`.
- nuevo `frontend/src/app/panel/metricas/page.tsx`:
  - Gate admin igual que `configuracion/page.tsx` (`esAdmin`; no autorizado → `StatusMessage`; sin sesión → login).
  - Inputs `desde`/`hasta` (`type="date"`), por defecto primer día del mes actual → hoy; botón "Actualizar".
  - Cards de métricas con el estilo de `panel/page.tsx` (`border-neutral-800 bg-neutral-900 p-5`): Ingresos (`formatearPrecio`), Ocupación (`%`), Turnos total + desglose por estado.
  - Lista "Servicios más pedidos": rank con barra proporcional por `cantidad` usando `<div>` con ancho %, sin librería de charts.
  - Estados de loading (skeletons), error (`StatusMessage` + Reintentar), vacío (`EmptyState`), link "Volver al panel".
  - Copia UI en español, identificadores/inglés en código.
- editar `frontend/src/app/panel/page.tsx` `navItems`: agregar `{ href: "/panel/metricas", label: "Métricas" }` en el bloque admin (junto a Configuración).

## Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `MetricasPanelPage` | `app/panel/metricas/page.tsx` | Vista admin con rango de fechas y cards. |
| `MetricasRangoForm` | `components/metricas/MetricasRangoForm.tsx` | Inputs de rango y botón "Actualizar". |
| `MetricasCards` | `components/metricas/MetricasCards.tsx` | Cards de ingresos, ocupación y turnos. |
| `ServiciosMasPedidosList` | `components/metricas/ServiciosMasPedidosList.tsx` | Ranking con barra proporcional. |
| `StatusMessage` | `components/ui/StatusMessage.tsx` | Estado de error con reintentar (reutilizable). |
| `EmptyState` | `components/ui/EmptyState.tsx` | Rango sin datos (reutilizable). |

## Dependencias y Riesgos

- Entidades `Turno`, `Servicio` y `Barbero` del modelo maestro.
- Convención de rango de fechas existente (`barberos.service.js`).
- **Riesgos:** acoplamiento con la semántica de rango → replicar helper local; cálculo de horas disponibles sensible a la zona horaria → usar `getUTCHours` (convención del repo).

## Technical Context

**Language/Version**: Backend Node.js (JavaScript); Frontend Next.js (App Router, TypeScript)

**Primary Dependencies**: ORM Prisma, Tailwind CSS, MCP (plataforma)

**Storage**: PostgreSQL (acceso vía MCP local)

**Testing**: `node --check` (backend); `npx tsc --noEmit` y `npx eslint` sobre archivos frontend modificados (verificación declarada en la spec)

**Target Platform**: Web

**Project Type**: web-service + web application

**Performance Goals**: consultas agregadas por rango; sin librería de charts (render con divs)

**Constraints**: admin-only; rango inclusivo hasta fin del día; nunca dividir por cero

**Scale/Scope**: un local

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec antes que código**: PASS — plan derivado de `spec.md` aprobada.
- **II. Gates secuenciales**: PASS — feature implementada según pipeline.
- **III. Contratos primero**: PASS — contrato de respuesta definido en la spec y reflejado aquí.
- **IV. Testing obligatorio**: PASS — verificación declarada (`node --check`, `tsc --noEmit`, `eslint`); suite automatizada general pendiente.
- **V. Modularidad y capas**: PASS — nuevo service/controller/rutas; el cálculo no vive en controllers; UI reutiliza `StatusMessage` y `EmptyState`.

## Project Structure

### Documentation (this feature)

```text
specs/011-metricas-dashboard/
├── plan.md
└── spec.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── services/metricas.service.js
│   ├── controllers/metricas.controller.js
│   ├── routes/metricas.routes.js
│   └── routes/index.js        # monta /metricas
└── tests/

frontend/
└── src/
    ├── types/api.ts
    ├── lib/api/metricas.ts
    ├── lib/hooks/useMetricas.ts
    ├── app/panel/metricas/page.tsx
    ├── app/panel/page.tsx      # navItems admin
    └── components/metricas/    # MetricasRangoForm, MetricasCards, ServiciosMasPedidosList
```

**Structure Decision**: se extiende la estructura web existente con un módulo de métricas backend y la vista `/panel/metricas` en el panel del frontend.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
