# Implementation Plan: Catálogo de Servicios

**Branch**: `002-catalogo-servicios` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-catalogo-servicios/spec.md`

## Summary

CRUD de servicios (nombre, descripción, duración, precio) con listado público de activos y gestión restringida al rol admin. Se usa borrado lógico (`activo`) para preservar el historial de turnos. Persistencia vía MCP PostgreSQL local sobre la entidad `Servicio`.

## Endpoints REST (Node.js)

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| `GET` | `/api/servicios` | Lista los servicios activos (público) o todos con `?incluirInactivos=true` (admin). | Público / Admin |
| `GET` | `/api/servicios/:id` | Detalle de un servicio. | Público |
| `POST` | `/api/servicios` | Crea un servicio. | Admin |
| `PATCH` | `/api/servicios/:id` | Actualiza campos de un servicio. | Admin |
| `DELETE` | `/api/servicios/:id` | Desactiva (borrado lógico) un servicio. | Admin |

**Contratos (alto nivel):**
- `POST/PATCH` body → `{ nombre, descripcion?, duracionMin, precio, activo? }`.
- `GET` lista → `Servicio[]` con `{ id, nombre, descripcion, duracionMin, precio, activo }`.

**Validaciones:** `nombre` no vacío y único, `duracionMin > 0`, `precio >= 0`.

**Errores esperados:** `400` datos inválidos, `404` servicio inexistente, `409` nombre duplicado, `401/403` sin permisos.

## Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `ServiciosPage` | `app/servicios/page.tsx` | Vista de catálogo (pública) y administración según rol. |
| `ServicioCard` | `components/servicios/ServicioCard.tsx` | Tarjeta con nombre, duración y precio; acción "Reservar". |
| `ServicioForm` | `components/servicios/ServicioForm.tsx` | Formulario de alta/edición con validaciones. |
| `ServicioFormModal` | `components/servicios/ServicioFormModal.tsx` | Modal que envuelve `ServicioForm` para crear/editar. |
| `ConfirmDeleteDialog` | `components/ui/ConfirmDeleteDialog.tsx` | Confirmación antes de desactivar (reutilizable). |
| `EmptyState` | `components/ui/EmptyState.tsx` | Mensaje cuando no hay servicios (reutilizable). |

**Estados de UI:** carga (skeleton), error, vacío, éxito; deshabilitado del formulario mientras guarda.

## Dependencias y Riesgos

- Entidad `Servicio` del modelo de datos maestro (ver `specs/000-arquitectura/plan.md`).
- Persistencia vía MCP PostgreSQL local.
- Relación con CU-03 (los servicios son seleccionables al reservar).
- **Riesgo:** desactivar un servicio referenciado por turnos futuros → resuelto conservando historial con borrado lógico.

## Technical Context

**Language/Version**: Backend Node.js (JavaScript); Frontend Next.js (App Router, TypeScript)

**Primary Dependencies**: plataforma backend (Express/rutas), Tailwind CSS, persistencia MCP

**Storage**: PostgreSQL (acceso vía MCP local)

**Testing**: suite automatizada pendiente; test del caso feliz y un caso de error por endpoint (CA-02.8); `node --check` (backend), `npx tsc --noEmit` / `npx eslint` (frontend)

**Target Platform**: Web (navegadores modernos)

**Project Type**: web-service + web application

**Performance Goals**: catálogo pequeño (decenas de servicios); sin objetivos especiales

**Constraints**: solo lectura pública; escritura solo admin; borrado lógico obligatorio

**Scale/Scope**: decenas de servicios, un local

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec antes que código**: PASS — plan derivado de `spec.md` aprobado.
- **II. Gates secuenciales**: PASS — feature implementada según pipeline; pendientes de testing documentados.
- **III. Contratos primero**: PASS — contratos request/response definidos en spec y reproducidos aquí.
- **IV. Testing obligatorio**: PASS CON PENDIENTE — CA-02.8 registrada como pendiente de suite automatizada.
- **V. Modularidad y capas**: PASS — validaciones en servicios/backend, no en controllers; UI reutiliza `EmptyState`/`ConfirmDeleteDialog`.

## Project Structure

### Documentation (this feature)

```text
specs/002-catalogo-servicios/
├── plan.md
└── spec.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/routes/          # servicios.routes
│   ├── api/controllers/     # servicios.controller
│   ├── services/            # logica de negocio de catalogo
│   └── mcp/postgres/        # persistencia
└── tests/

frontend/
└── src/
    ├── app/servicios/       # page.tsx (catalogo publico + admin)
    └── components/
        ├── servicios/       # ServicioCard, ServicioForm, ServicioFormModal
        └── ui/              # ConfirmDeleteDialog, EmptyState
```

**Structure Decision**: se extiende la estructura web existente; catálogo en `app/servicios` con componentes dedicados en `components/servicios`.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
