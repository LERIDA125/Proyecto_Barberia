# Implementation Plan: Historial de Visitas (Fichas de Cliente)

**Branch**: `009-historial-visitas` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-historial-visitas/spec.md`

## Summary

Historial de visitas del cliente (turnos completados) y fichas de cliente para el staff, con control de acceso estricto y privacidad de observaciones. Se construye a partir de los turnos en estado `completado` y alimenta métricas (CU-05) y atención personalizada.

## Endpoints REST (Node.js)

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| `GET` | `/api/clientes/me/historial` | Historial de visitas del cliente autenticado (`?desde=&hasta=`). | Cliente |
| `GET` | `/api/clientes/me/ficha` | Datos y preferencias del propio cliente. | Cliente |
| `PATCH` | `/api/clientes/me/ficha` | Actualiza datos/observaciones propias. | Cliente |
| `GET` | `/api/clientes` | Búsqueda/listado de clientes (para staff). | Barbero / Admin |
| `GET` | `/api/clientes/:id/historial` | Historial de visitas de un cliente (staff). | Barbero / Admin |
| `GET` | `/api/clientes/:id/ficha` | Ficha completa de un cliente. | Barbero / Admin |

**Contratos (alto nivel):**
- `historial` ⇒ `Turno[]` completados con `{ fecha, servicio, barbero, importe? }` y contadores (`totalVisitas`, `ultimaVisita`).
- `ficha` ⇒ `{ cliente, preferencias, observaciones, historialReciente[] }`.

**Reglas de negocio:**
- Solo el propio cliente o el staff autorizado accede al historial.
- El historial se construye a partir de turnos en estado `completado`.
- Las `observaciones` de la ficha son visibles para el staff (no para otros clientes).

**Errores esperados:** `403` sin permiso, `404` cliente inexistente, `400` filtros de fecha inválidos.

## Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `MiHistorialPage` | `app/mis-turnos/historial/page.tsx` | Historial del cliente con filtros por fecha. |
| `HistorialTimeline` | `components/clientes/HistorialTimeline.tsx` | Línea de tiempo de visitas. |
| `VisitaItem` | `components/clientes/VisitaItem.tsx` | Ítem de visita (fecha, servicio, barbero). |
| `ClientesPage` | `app/clientes/page.tsx` | Listado/búsqueda de clientes (staff). |
| `ClienteFicha` | `components/clientes/ClienteFicha.tsx` | Ficha con datos, preferencias y observaciones. |
| `ResumenContadores` | `components/clientes/ResumenContadores.tsx` | Total de visitas, última visita, frecuencia. |
| `EmptyState` | `components/ui/EmptyState.tsx` | Sin visitas aún (reutilizable). |

**Estados de UI:** carga (skeleton), sin historial, error, paginación/scroll infinito.

## Dependencias y Riesgos

- Entidades `Usuario` y `Turno` del modelo maestro; CU-04 y CU-05.
- Requiere campos de **ficha/observaciones** del cliente (escalar al modelo maestro en `specs/000-arquitectura/plan.md`).
- MCP PostgreSQL para consultas históricas.
- **Riesgos:** volumen de historial → paginación e índices por `cliente_id` y `fecha`; privacidad de datos personales → control estricto de acceso.

## Technical Context

**Language/Version**: Backend Node.js (JavaScript); Frontend Next.js (App Router, TypeScript)

**Primary Dependencies**: ORM Prisma, Tailwind CSS, MCP (plataforma)

**Storage**: PostgreSQL (acceso vía MCP local)

**Testing**: suite automatizada pendiente; test del caso feliz y un caso de error por endpoint (CA-09.8); `node --check` (backend)

**Target Platform**: Web

**Project Type**: web-service + web application

**Performance Goals**: consultas históricas paginadas e indexadas por cliente y fecha

**Constraints**: historial solo de turnos completados; privacidad de observaciones; control de acceso por rol y propiedad

**Scale/Scope**: un local; historial creciente por cliente

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec antes que código**: PASS — plan derivado de `spec.md`.
- **II. Gates secuenciales**: PASS — feature implementada según pipeline.
- **III. Contratos primero**: PASS — contratos de historial/ficha definidos en la spec.
- **IV. Testing obligatorio**: PASS CON PENDIENTE — CA-09.8 sin suite automatizada.
- **V. Modularidad y capas**: PASS — consultas y armado de ficha en services; UI reutiliza `EmptyState` y componentes de clientes.

## Project Structure

### Documentation (this feature)

```text
specs/009-historial-visitas/
├── plan.md
└── spec.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── routes/              # clientes.routes.js
│   ├── controllers/         # clientes.controller.js
│   ├── services/            # clientes.service.js (historial, ficha)
│   └── mcp/postgres/        # persistencia
└── tests/

frontend/
└── src/
    ├── app/
    │   ├── mis-turnos/historial/   # page.tsx
    │   └── clientes/               # page.tsx (staff)
    └── components/
        ├── clientes/               # HistorialTimeline, VisitaItem, ClienteFicha, ResumenContadores
        └── ui/                     # EmptyState
```

**Structure Decision**: se extiende la estructura web existente con la vista de historial del cliente y la de clientes para el staff.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
