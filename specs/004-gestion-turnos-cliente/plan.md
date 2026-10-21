# Implementation Plan: Gestión de Turnos del Cliente

**Branch**: `004-gestion-turnos-cliente` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-gestion-turnos-cliente/spec.md`

## Summary

Backend implementado para listar, cancelar y reprogramar turnos del cliente, con control de propiedad y de transición de estado. La sincronización con Google Calendar queda pendiente (CU-07), por lo que el reflejo en la agenda externa no está activo. Reutiliza la consulta de disponibilidad de CU-03.

## Endpoints REST (Node.js)

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| `GET` | `/api/turnos` | Lista los turnos del usuario (`?estado=&desde=&hasta=`). | Autenticado / dueño |
| `GET` | `/api/turnos/:id` | Detalle de un turno propio. | Autenticado / dueño |
| `PATCH` | `/api/turnos/:id/cancelar` | Cancela un turno propio. | Autenticado / dueño |
| `PATCH` | `/api/turnos/:id/reprogramar` | Reagenda el turno a una nueva franja. | Autenticado / dueño |
| `GET` | `/api/barberos/:id/disponibilidad` | Franjas disponibles para reprogramar (ver CU-03). | Autenticado |

**Contratos (alto nivel):**
- `GET /api/turnos` ⇒ `Turno[]` con datos del barbero y servicio incorporados.
- `cancelar` ⇒ `{ estado: "cancelado" }`; elimina/actualiza el evento en Google Calendar.
- `reprogramar` body → `{ nuevaFechaInicio }` ⇒ `Turno` actualizado.

**Reglas de negocio:**
- Solo el **dueño** (o admin) puede cancelar/reprogramar.
- No se puede cancelar ni reprogramar un turno `completado` o ya `cancelado`.
- La nueva franja debe estar disponible y dentro del horario del barbero.
- Puede aplicarse una **ventana mínima** de cancelación (parámetro configurable).

**Errores esperados:** `403` no es dueño, `404` turno inexistente, `409` estado no cancelable o franja ocupada, `422` fuera de horario/ventana.

## Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `MisTurnosPage` | `app/mis-turnos/page.tsx` | Listado de próximos e históricos con filtros por estado. |
| `TurnoCard` | `components/turnos/TurnoCard.tsx` | Resumen del turno con estado, fecha, barbero y servicio. |
| `TurnoDetalle` | `components/turnos/TurnoDetalle.tsx` | Vista de detalle con acciones disponibles. |
| `CancelarTurnoDialog` | `components/turnos/CancelarTurnoDialog.tsx` | Confirmación de cancelación con motivo opcional. |
| `ReprogramarDialog` | `components/turnos/ReprogramarDialog.tsx` | Selección de nueva fecha/hora disponible. |
| `EstadoBadge` | `components/ui/EstadoBadge.tsx` | Etiqueta de color según estado del turno (reutilizable). |
| `EmptyState` | `components/ui/EmptyState.tsx` | Mensaje cuando no hay turnos (reutilizable). |

**Estados de UI:** carga (skeleton), vacío, error, acciones deshabilitadas según estado del turno.

## Dependencias y Riesgos

- Entidad `Turno` del modelo maestro (CU-03).
- MCP PostgreSQL (persistencia) y MCP Google Calendar (actualización del evento, pendiente).
- Reutiliza la consulta de disponibilidad de CU-03.
- **Riesgos:** consistencia entre el estado local del turno y el evento en Google Calendar (reintentos/compensación); la ventana mínima de cancelación debe definirse como parámetro, no hardcodeada.

## Technical Context

**Language/Version**: Backend Node.js (JavaScript); Frontend Next.js (App Router, TypeScript)

**Primary Dependencies**: ORM Prisma, Tailwind CSS, MCP (plataforma)

**Storage**: PostgreSQL (acceso vía MCP local)

**Testing**: suite automatizada pendiente; test del caso feliz y un caso de error por endpoint (CA-04.8); `node --check` (backend)

**Target Platform**: Web

**Project Type**: web-service + web application

**Performance Goals**: listado paginable de turnos propios; operaciones transaccionales de estado

**Constraints**: control de propiedad obligatorio; transiciones de estado válidas; ventana de cancelación parametrizable

**Scale/Scope**: un local

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec antes que código**: PASS — plan derivado de `spec.md`.
- **II. Gates secuenciales**: PASS — CA-04.3 (sync Calendar) pendiente y documentado por dependencia de CU-07.
- **III. Contratos primero**: PASS — contratos de cancelación/reprogramación definidos en la spec.
- **IV. Testing obligatorio**: PASS CON PENDIENTE — CA-04.8 sin suite automatizada.
- **V. Modularidad y capas**: PASS — lógica de estado y propiedad en `turnos.service`, reutilizando el service de CU-03.

## Project Structure

### Documentation (this feature)

```text
specs/004-gestion-turnos-cliente/
├── plan.md
└── spec.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── routes/              # turnos.routes.js
│   ├── controllers/         # turnos.controller.js
│   ├── services/            # turnos.service.js (cancelar, reprogramar, listar)
│   └── mcp/postgres/        # persistencia
└── tests/

frontend/
└── src/
    ├── app/mis-turnos/      # page.tsx
    └── components/
        ├── turnos/          # TurnoCard, TurnoDetalle, CancelarTurnoDialog, ReprogramarDialog
        └── ui/              # EstadoBadge, EmptyState
```

**Structure Decision**: se extiende la estructura web existente con la vista `app/mis-turnos` y componentes de turnos reutilizables.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
