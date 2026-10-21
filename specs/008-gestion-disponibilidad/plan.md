# Implementation Plan: Gestión de Disponibilidad y Ausencias

**Branch**: `008-gestion-disponibilidad` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-gestion-disponibilidad/spec.md`

## Summary

Motor de disponibilidad (horario laboral − turnos ocupados − bloqueos − feriados globales), con gestión de horarios semanales y bloqueos por el barbero y feriados globales por el administrador. Centraliza el cálculo en un único service para evitar divergencias y alimenta la disponibilidad de CU-03.

## Endpoints REST (Node.js)

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| `GET` | `/api/disponibilidad` | Franjas disponibles (`?barberoId=&servicioId=&fecha=`). | Público |
| `GET` | `/api/barberos/me/horarios` | Horarios laborales configurados del barbero. | Barbero |
| `PUT` | `/api/barberos/me/horarios` | Reemplaza los horarios laborales semanales. | Barbero |
| `GET` | `/api/barberos/me/bloqueos` | Lista bloqueos/ausencias (`?desde=&hasta=`). | Barbero / Admin |
| `POST` | `/api/barberos/me/bloqueos` | Crea un bloqueo (`{ inicio, fin, motivo }`). | Barbero / Admin |
| `DELETE` | `/api/barberos/me/bloqueos/:id` | Elimina un bloqueo propio. | Barbero / Admin |
| `POST` | `/api/admin/feriados` | Registra un feriado/cierre global. | Admin |

**Contratos (alto nivel):**
- `GET /api/disponibilidad` ⇒ `{ fecha, barberoId, servicioId, franjas: [{ inicio, fin }] }`.
- `horarios` body → `{ dias: [{ dia: 0-6, inicio, fin }] }`.
- `bloqueos` body → `{ inicio, fin, motivo }`.

**Reglas de negocio (motor de disponibilidad):**
- Disponibilidad = **horario laboral del barbero** − **turnos ocupados** − **bloqueos** − **feriados globales**.
- Las franjas se generan en intervalos iguales a `Servicio.duracionMin`.
- Horario coherente: `inicio < fin`; días válidos `0..6`.
- Un bloqueo no puede solaparse con un turno ya confirmado sin advertencia.

**Errores esperados:** `400` horario/bloqueo inválido, `404` barbero/bloqueo inexistente, `409` bloqueo solapa turnos existentes, `403` sin permisos.

## Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `DisponibilidadPage` | `app/barberos/disponibilidad/page.tsx` | Vista de horarios y bloqueos del barbero. |
| `HorarioSemanalEditor` | `components/barberos/HorarioSemanalEditor.tsx` | Editor de días/horas laborales. |
| `BloqueoForm` | `components/barberos/BloqueoForm.tsx` | Alta de bloqueo con rango y motivo. |
| `BloqueoList` | `components/barberos/BloqueoList.tsx` | Lista de bloqueos con eliminar. |
| `DisponibilidadPreview` | `components/barberos/DisponibilidadPreview.tsx` | Previsualización de franjas resultantes. |
| `FechaRangePicker` | `components/ui/FechaRangePicker.tsx` | Selección de rango de fechas (reutilizable). |

**Estados de UI:** carga, sin horarios configurados, sin bloqueos, advertencia de solapamiento.

## Dependencias y Riesgos

- Entidades `Barbero` y `Turno` del modelo maestro; CU-03 y CU-05.
- Requiere nuevas entidades de dominio: **HorarioLaboral, Bloqueo y Feriado** (escalar al modelo maestro en `specs/000-arquitectura/plan.md`).
- MCP PostgreSQL para persistencia.
- **Riesgos:** cambiar horarios con turnos ya reservados → validar y advertir; cálculo de franjas y zona horaria → centralizar en un único `disponibilidad.service`.

## Technical Context

**Language/Version**: Backend Node.js (JavaScript); Frontend Next.js (App Router, TypeScript)

**Primary Dependencies**: ORM Prisma, Tailwind CSS, MCP (plataforma)

**Storage**: PostgreSQL (acceso vía MCP local)

**Testing**: suite automatizada pendiente; test del caso feliz y un caso de error por endpoint (CA-08.8); `node --check` (backend)

**Target Platform**: Web

**Project Type**: web-service + web application

**Performance Goals**: cálculo de franjas por fecha y barbero acotado al rango consultado

**Constraints**: coherencia de horarios; bloqueos compatibles con turnos confirmados; zona horaria centralizada

**Scale/Scope**: un local, varios barberos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec antes que código**: PASS — plan derivado de `spec.md`.
- **II. Gates secuenciales**: PASS — feature implementada según pipeline.
- **III. Contratos primero**: PASS — endpoints y contratos de franjas/horarios/bloqueos definidos en la spec.
- **IV. Testing obligatorio**: PASS CON PENDIENTE — CA-08.8 sin suite automatizada.
- **V. Modularidad y capas**: PASS — el cálculo se centraliza en un service único; la UI no computa disponibilidad.

## Project Structure

### Documentation (this feature)

```text
specs/008-gestion-disponibilidad/
├── plan.md
└── spec.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── routes/              # disponibilidad.routes, barberos.routes (horarios/bloqueos), admin.routes (feriados)
│   ├── controllers/
│   ├── services/            # disponibilidad.service.js (motor unico)
│   └── mcp/postgres/        # persistencia
└── tests/

frontend/
└── src/
    ├── app/barberos/disponibilidad/   # page.tsx
    └── components/
        ├── barberos/                  # HorarioSemanalEditor, BloqueoForm, BloqueoList, DisponibilidadPreview
        └── ui/                        # FechaRangePicker
```

**Structure Decision**: se extiende la estructura web existente; el motor de disponibilidad vive en un único service y la gestión en `app/barberos/disponibilidad`.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
