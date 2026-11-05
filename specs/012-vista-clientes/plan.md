# Implementation Plan: Vista de Clientes

**Branch**: `012-vista-clientes` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-vista-clientes/spec.md`

**Estado:** aprobada (09-S). Alcance: barbero/admin. Frontend: panel `/panel/clientes`.

## Summary

Nuevo endpoint `GET /api/clientes?limite=` (listado completo de clientes) y extensión de `GET /api/clientes/:id/historial` con un `resumen` de valor calculado en JS sobre los turnos ya traídos. En el frontend, la vista `/panel/clientes` carga completa, filtra y ordena en el cliente, y la ficha muestra el resumen de valor.

## Backend

### 1. Nuevo `GET /api/clientes?limite=`

- Auth: `requiereAuth` + `requiereRol('barbero', 'admin')` (mismo patrón que `/buscar`).
- `limite` opcional: default 200, cap 500; inválido → 400.
- Implementación: `prisma.usuario.findMany({ where: { rol: 'cliente' }, orderBy: { nombre: 'asc' }, take: limite, include: { _count: { select: { turnos: true } } } })`, luego serializar.
- Respuesta 200: array

```json
[{ "id": "uuid", "nombre": "Ana", "email": "ana@x.com", "telefono": null, "activo": true, "totalTurnos": 7 }]
```

### 2. Extender `GET /api/clientes/:id/historial`

La respuesta actual (`{ cliente, turnos }`) gana un campo `resumen` calculado en JS sobre los turnos ya traídos (sin consultas nuevas):

```json
{ "totalTurnos": 7, "completados": 5, "totalGastado": 54000, "ultimaVisita": "2026-10-02T14:00:00.000Z" }
```

- `totalTurnos` = `turnos.length`; `completados` = conteo `estado === 'completado'`; `totalGastado` = Σ `servicio.precio` (Number) de completados; `ultimaVisita` = `turnos[0]?.fechaInicio ?? null` (la consulta ya ordena desc).

## Archivos backend

- editar `backend/src/services/clientes.service.js` → `listarClientes({ limite })` + `resumen` en `obtenerHistorialCliente`
- editar `backend/src/controllers/clientes.controller.js` → handler `listarClientes`
- editar `backend/src/routes/clientes.routes.js` → `router.get('/', ...)`

## Frontend

- `frontend/src/types/api.ts`: `Cliente.totalTurnos?: number`; `HistorialCliente.resumen: ResumenCliente | null` (interface nueva).
- editar `frontend/src/lib/api/clientes.ts`: `getClientes(limite?)`; conservar el resto.
- nuevo `frontend/src/lib/hooks/useClientes.ts`: patrón `firma`/`habilitado` de los hooks existentes; recarga con `Reintentar`.
- editar `frontend/src/components/panel/FichaCliente.tsx`: encabezado con `resumen` — Total turnos, Completados, Total gastado (`formatearPrecio`), Última visita (`formatearFechaHora`) — visible aunque no haya turnos; el historial sigue como está.
- editar `frontend/src/app/panel/clientes/page.tsx`:
  - Carga completa de clientes al montar; la lista deja de depender de tener ≥2 caracteres.
  - Filtro client-side en vivo (case-insensitive sobre `nombre` y `email`, sin mínimo de caracteres).
  - Orden client-side: **Nombre** | **Más turnos** (select).
  - Ítem de lista: nombre + email + badge de `totalTurnos` (ej: "7 turnos").
  - Estado vacío cuando el filtro no matchea vs. cuando no hay clientes.
  - No romper la ficha/historial existentes (siguen dependiendo de `/buscar` + `/:id/historial`).
  - Copia UI en español, identificadores en inglés.

## Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `ClientesPanelPage` | `app/panel/clientes/page.tsx` | Listado completo con filtro y orden client-side. |
| `ClientesFiltro` | `components/clientes/ClientesFiltro.tsx` | Filtro en vivo y selector de orden. |
| `ClienteListItem` | `components/clientes/ClienteListItem.tsx` | Nombre, email y badge de `totalTurnos`. |
| `FichaCliente` (editar) | `components/panel/FichaCliente.tsx` | Encabezado con resumen de valor. |
| `EmptyState` | `components/ui/EmptyState.tsx` | Estados vacíos diferenciados (reutilizable). |

## Dependencias y Riesgos

- Endpoints existentes `GET /api/clientes/buscar` y `GET /api/clientes/:id/historial`.
- Entidades `Usuario` (rol cliente) y `Turno` del modelo maestro.
- **Riesgos:** romper la ficha/historial existentes → conservar los endpoints actuales; respuestas grandes → cap de 500 y paginación futura.

## Technical Context

**Language/Version**: Backend Node.js (JavaScript); Frontend Next.js (App Router, TypeScript)

**Primary Dependencies**: ORM Prisma, Tailwind CSS, MCP (plataforma)

**Storage**: PostgreSQL (acceso vía MCP local)

**Testing**: `node --check` (backend); `npx tsc --noEmit` y `npx eslint` sobre archivos frontend modificados (verificación declarada en la spec)

**Target Platform**: Web

**Project Type**: web-service + web application

**Performance Goals**: carga única de hasta 500 clientes con conteo de turnos; filtro/orden sin recarga

**Constraints**: roles barbero/admin; resumen calculado sin consultas nuevas; no romper endpoints existentes

**Scale/Scope**: un local; cartera de clientes creciente

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec antes que código**: PASS — plan derivado de `spec.md` aprobada.
- **II. Gates secuenciales**: PASS — feature implementada según pipeline.
- **III. Contratos primero**: PASS — contratos de listado y `resumen` definidos en la spec y reflejados aquí.
- **IV. Testing obligatorio**: PASS — verificación declarada (`node --check`, `tsc --noEmit`, `eslint`); suite automatizada general pendiente.
- **V. Modularidad y capas**: PASS — la lógica de listado/resumen vive en `clientes.service`; la UI reutiliza `EmptyState`.

## Project Structure

### Documentation (this feature)

```text
specs/012-vista-clientes/
├── plan.md
└── spec.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── services/clientes.service.js
│   ├── controllers/clientes.controller.js
│   └── routes/clientes.routes.js
└── tests/

frontend/
└── src/
    ├── types/api.ts
    ├── lib/api/clientes.ts
    ├── lib/hooks/useClientes.ts
    ├── app/panel/clientes/page.tsx
    ├── components/panel/FichaCliente.tsx
    ├── components/clientes/          # ClientesFiltro, ClienteListItem
    └── components/ui/EmptyState.tsx
```

**Structure Decision**: se extiende la estructura web existente; el listado de clientes se integra en `app/panel/clientes` reutilizando la ficha existente.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
