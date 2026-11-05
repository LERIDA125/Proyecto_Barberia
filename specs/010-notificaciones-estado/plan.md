# Implementation Plan: Notificaciones de Estado de Turno

**Branch**: `010-notificaciones-estado` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-notificaciones-estado/spec.md`

## Summary

Notificaciones internas (centro de notificaciones) y externas (email) generadas por cambios de estado de turno, con gestión de preferencias y recordatorios previos. La notificación interna se conserva ante fallos del proveedor de email. Idempotencia por turno y tipo de evento.

## Endpoints REST (Node.js)

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| `GET` | `/api/notificaciones` | Lista las notificaciones del usuario (`?leidas=`). | Autenticado |
| `PATCH` | `/api/notificaciones/:id/leer` | Marca una notificación como leída. | Autenticado / dueño |
| `PATCH` | `/api/notificaciones/leer-todas` | Marca todas como leídas. | Autenticado |
| `GET` | `/api/notificaciones/preferencias` | Preferencias de notificación del usuario. | Autenticado |
| `PUT` | `/api/notificaciones/preferencias` | Actualiza preferencias (email on/off, recordatorios). | Autenticado |
| `POST` | `/api/admin/notificaciones/recordatorios` | Dispara el envío de recordatorios pendientes (job/manual). | Admin / Sistema |

**Contratos (alto nivel):**
- `GET /api/notificaciones` ⇒ `Notificacion[]` `{ id, tipo, mensaje, turnoId?, leida, createdAt }`.
- `preferencias` body → `{ email: boolean, recordatorios: boolean, horasAntes: number }`.

**Eventos que generan notificación:**
- Turno creado/confirmado → aviso al cliente y al barbero.
- Turno reprogramado o cancelado → aviso a ambos.
- Recordatorio → aviso al cliente `horasAntes` antes del turno.
- Turno completado → aviso al cliente (opcional, para reseña futura).

**Errores esperados:** `400` preferencias inválidas, `403` notificación ajena, `404` notificación inexistente, `502` fallo del proveedor de email.

## Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `NotificationBell` | `components/layout/NotificationBell.tsx` | Ícono con contador de no leídas. |
| `NotificationCenter` | `components/notificaciones/NotificationCenter.tsx` | Panel/dropdown con la lista. |
| `NotificationItem` | `components/notificaciones/NotificationItem.tsx` | Ítem individual con acción de leer. |
| `Toast` | `components/ui/Toast.tsx` | Aviso inmediato ante cambios de estado (reutilizable). |
| `PreferenciasNotificacionForm` | `components/notificaciones/PreferenciasNotificacionForm.tsx` | Configuración de preferencias. |
| `useNotificaciones` | `lib/hooks/useNotificaciones.ts` | Hook para estado, contador y marcado como leídas. |

**Estados de UI:** sin notificaciones, con no leídas, carga, error de envío.

## Dependencias y Riesgos

- Entidad `Turno` del modelo maestro; CU-03 y CU-04 (generan eventos de estado).
- Requiere nuevas entidades de dominio: **Notificacion, PreferenciaNotificacion** (escalar al modelo maestro en `specs/000-arquitectura/plan.md`).
- Proveedor de email (a definir por el Tech Lead) y job de recordatorios.
- **Riesgos:** envío duplicado de notificaciones → idempotencia por `turnoId` + tipo de evento; recordatorios con zona horaria incorrecta → timestamps absolutos y zona horaria del sistema; privacidad: no incluir datos sensibles en el cuerpo del email.

## Technical Context

**Language/Version**: Backend Node.js (JavaScript); Frontend Next.js (App Router, TypeScript)

**Primary Dependencies**: ORM Prisma, proveedor de email (a definir), Tailwind CSS, MCP (plataforma)

**Storage**: PostgreSQL (acceso vía MCP local)

**Testing**: suite automatizada pendiente; test del caso feliz y un caso de error por endpoint (CA-10.8); `node --check` (backend)

**Target Platform**: Web + proveedor de email externo

**Project Type**: web-service + web application

**Performance Goals**: generación de notificaciones desacoplada del cambio de estado; recordatorios por job

**Constraints**: idempotencia por turno y tipo; conservar notificación interna ante fallo de email; privacidad del contenido

**Scale/Scope**: un local; notificaciones por usuario

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec antes que código**: PASS — plan derivado de `spec.md`.
- **II. Gates secuenciales**: PASS — feature implementada según pipeline.
- **III. Contratos primero**: PASS — contratos de notificaciones/preferencias definidos en la spec.
- **IV. Testing obligatorio**: PASS CON PENDIENTE — CA-10.8 sin suite automatizada.
- **V. Modularidad y capas**: PASS — la generación de notificaciones vive en services; la UI reutiliza `Toast`.

## Project Structure

### Documentation (this feature)

```text
specs/010-notificaciones-estado/
├── plan.md
└── spec.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── routes/              # notificaciones.routes, admin.routes (recordatorios)
│   ├── controllers/         # notificaciones.controller
│   ├── services/            # notificaciones.service (generacion, sendEmail, preferencias)
│   └── mcp/postgres/        # persistencia
└── tests/

frontend/
└── src/
    └── components/
        ├── layout/          # NotificationBell
        ├── notificaciones/  # NotificationCenter, NotificationItem, PreferenciasNotificacionForm
        └── ui/              # Toast
```

**Structure Decision**: se extiende la estructura web existente con el centro de notificaciones en `components/notificaciones` y el servicio de notificaciones en el backend.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
