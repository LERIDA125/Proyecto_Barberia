# Implementation Plan: Panel de Barberos

**Branch**: `005-panel-barberos` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-panel-barberos/spec.md`

## Summary

Panel del barbero con agenda diaria/semanal, cambio de estado de turnos con transiciones validadas, administración de horario/días laborales y métricas básicas. Backend implementado (agenda, estados, disponibilidad, métricas). Los cambios de horario alimentan la disponibilidad pública de CU-03.

## Endpoints REST (Node.js)

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| `GET` | `/api/barberos/me/agenda` | Agenda del barbero (`?desde=&hasta=`). | Barbero |
| `GET` | `/api/barberos/:id/agenda` | Agenda de un barbero (admin). | Admin |
| `PATCH` | `/api/turnos/:id/estado` | Actualiza el estado del turno (`confirmado`/`completado`/`cancelado`). | Barbero asignado / Admin |
| `GET` | `/api/barberos/me/disponibilidad` | Horario y días laborales configurados. | Barbero |
| `PUT` | `/api/barberos/me/disponibilidad` | Actualiza horario y días laborales. | Barbero |
| `GET` | `/api/barberos/me/metricas` | Métricas básicas (turnos del día/semana, completados, cancelados). | Barbero / Admin |

**Contratos (alto nivel):**
- `PATCH /api/turnos/:id/estado` body → `{ estado }` ⇒ `Turno` actualizado.
- `PUT /api/barberos/me/disponibilidad` body → `{ horarioInicio, horarioFin, diasLaborales }` ⇒ config actualizada.
- `GET /api/barberos/me/agenda` ⇒ `Turno[]` con datos del cliente y servicio.

**Reglas de negocio:**
- Un barbero solo puede modificar turnos **asignados a él**.
- Las transiciones de estado son válidas solo en el orden permitido (`pendiente → confirmado → completado`; `cancelado` desde `pendiente`/`confirmado`).
- Los días laborales son un subconjunto de la semana (0–6) y el horario es coherente (`inicio < fin`).

**Errores esperados:** `403` no es el barbero asignado, `404` turno inexistente, `409` transición de estado inválida, `400` horario/días inválidos.

## Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `PanelBarberoPage` | `app/barberos/page.tsx` | Contenedor del panel con resumen y agenda. |
| `AgendaDia` | `components/barberos/AgendaDia.tsx` | Vista de turnos del día seleccionado. |
| `AgendaSemana` | `components/barberos/AgendaSemana.tsx` | Vista semanal de la agenda. |
| `TurnoBarberoRow` | `components/barberos/TurnoBarberoRow.tsx` | Fila de turno con acciones de estado. |
| `EstadoActions` | `components/barberos/EstadoActions.tsx` | Botones de cambio de estado según transición válida. |
| `DisponibilidadForm` | `components/barberos/DisponibilidadForm.tsx` | Edición de horario y días laborales. |
| `MetricasResumen` | `components/barberos/MetricasResumen.tsx` | Tarjetas con contadores del día/semana. |
| `EstadoBadge` | `components/ui/EstadoBadge.tsx` | Etiqueta de estado del turno (reutilizable). |

**Estados de UI:** carga (skeleton), sin turnos, error, botones de acción según estado/permisos.

## Dependencias y Riesgos

- Entidades `Barbero` y `Turno` del modelo maestro (CU-03, CU-04).
- Consulta de disponibilidad de CU-03 (los cambios de horario la afectan).
- MCP PostgreSQL para persistencia de turnos y configuración.
- **Riesgos:** coherencia entre la disponibilidad configurada y los turnos ya reservados; control de permisos por asignación (evitar que un barbero edite turnos ajenos).

## Technical Context

**Language/Version**: Backend Node.js (JavaScript); Frontend Next.js (App Router, TypeScript)

**Primary Dependencies**: ORM Prisma, Tailwind CSS, MCP (plataforma)

**Storage**: PostgreSQL (acceso vía MCP local)

**Testing**: suite automatizada pendiente; test del caso feliz y un caso de error por endpoint (CA-05.8); `node --check` (backend)

**Target Platform**: Web

**Project Type**: web-service + web application

**Performance Goals**: agenda por rango de fechas; cálculos de métricas acotados al período

**Constraints**: permisos por asignación; transiciones válidas; coherencia de horarios

**Scale/Scope**: un local, varios barberos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec antes que código**: PASS — plan derivado de `spec.md`.
- **II. Gates secuenciales**: PASS — feature implementada según pipeline.
- **III. Contratos primero**: PASS — endpoints y respuestas definidos en la spec.
- **IV. Testing obligatorio**: PASS CON PENDIENTE — CA-05.8 sin suite automatizada.
- **V. Modularidad y capas**: PASS — permisos y transiciones viven en los services, no en controllers; UI reutiliza `EstadoBadge`.

## Project Structure

### Documentation (this feature)

```text
specs/005-panel-barberos/
├── plan.md
└── spec.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── routes/              # barberos.routes.js, turnos.routes.js
│   ├── controllers/         # barberos.controller.js, turnos.controller.js
│   ├── services/            # barberos.service.js, turnos.service.js
│   └── mcp/postgres/        # persistencia
└── tests/

frontend/
└── src/
    ├── app/barberos/        # page.tsx (panel)
    └── components/
        ├── barberos/        # AgendaDia, AgendaSemana, TurnoBarberoRow, EstadoActions, DisponibilidadForm, MetricasResumen
        └── ui/              # EstadoBadge
```

**Structure Decision**: se extiende la estructura web existente; el panel vive en `app/barberos` con componentes dedicados.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
