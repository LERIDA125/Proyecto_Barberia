# Implementation Plan: Reserva de Turnos

**Branch**: `003-reserva-turnos` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-reserva-turnos/spec.md`

## Summary

Flujo de reserva (wizard en UI + creación por chat) que valida disponibilidad, horario laboral y fecha futura, y persiste el turno dentro de una transacción con chequeo de solapamiento. En el MVP se persiste con estado `confirmado` y `google_event_id = null` (sin MCP Google Calendar). Backend implementado y verificado en vivo.

## Endpoints REST (Node.js)

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| `GET` | `/api/barberos` | Lista barberos activos (para elegir). | Autenticado |
| `GET` | `/api/barberos/:id/disponibilidad` | Franjas horarias libres (`?fecha=YYYY-MM-DD&servicioId=`). | Autenticado |
| `GET` | `/api/servicios` | Servicios disponibles para reservar (ver CU-02). | Público |
| `POST` | `/api/turnos` | Crea un turno (`cliente`, `barbero`, `servicio`, fecha/hora). | Autenticado |
| `GET` | `/api/turnos/:id` | Detalle/confirmación de un turno. | Autenticado / dueño |
| `POST` | `/api/asistente/mensaje` | Envía un mensaje al agente LangChain (creación de turno por chat). | Autenticado |

**Contratos (alto nivel):**
- `disponibilidad` ⇒ `{ fecha, barberoId, franjas: [{ inicio, fin }] }`.
- `POST /api/turnos` body → `{ barberoId, servicioId, fechaInicio }` ⇒ `Turno` (`estado: "confirmado"`).
- `POST /api/asistente/mensaje` body → `{ mensaje }` ⇒ `{ respuesta, turnoCreado? }`.

**Reglas de negocio:**
- No debe existir **solapamiento** de turnos para un mismo barbero.
- La franja debe estar dentro del **horario laboral** del barbero.
- `fecha_inicio` debe ser futura.
- La duración del turno se toma del `Servicio.duracionMin`.

**Errores esperados:** `400` datos inválidos, `409` franja ya ocupada, `422` fuera de horario, `404` barbero/servicio inexistente.

## Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `ReservarWizard` | `app/reservar/page.tsx` | Contenedor del flujo paso a paso y estado de la reserva. |
| `StepServicio` | `components/reservar/StepServicio.tsx` | Paso 1: elección de servicio. |
| `StepBarbero` | `components/reservar/StepBarbero.tsx` | Paso 2: elección de barbero. |
| `StepFechaHora` | `components/reservar/StepFechaHora.tsx` | Paso 3: calendario + selección de franja disponible. |
| `StepConfirmacion` | `components/reservar/StepConfirmacion.tsx` | Paso 4: resumen y confirmación. |
| `Stepper` | `components/ui/Stepper.tsx` | Indicador de progreso del wizard (reutilizable). |
| `ChatWidget` | `components/chat/ChatWidget.tsx` | Ventana de chat con el asistente para reservar por lenguaje natural. |

**Estados de UI:** carga (disponibilidad), sin disponibilidad, error de solapamiento, confirmación exitosa.

## Implementación verificada (backend)

- **Endpoint:** `POST /api/turnos` (montado en `src/routes/index.js` → `src/routes/turnos.routes.js`) exige `requiereAuth`.
- **Controller:** `src/controllers/turnos.controller.js` — `crear()` resuelve `clienteId` (propio o del admin) y delega en el service.
- **Service:** `src/services/turnos.service.js` — `crear()` valida campos/UUIDs, fecha futura, existencia y `activo` de servicio/barbero/cliente, calcula `fechaFin = fechaInicio + servicio.duracionMin` (línea 63), valida horario laboral (`validarHorario`) y crea dentro de `$transaction` con chequeo de solapamiento (409).
- **Estado inicial:** `confirmado`; `google_event_id` queda `null` (sin MCP Google Calendar).
- **Verificado en vivo:** `201` en creación, `409` en solapamiento, `401` sin sesión, `200` en `/api/health`. Sin errores 404/500 en el flujo.

## Dependencias y Riesgos

- Entidades `Turno`, `Barbero`, `Servicio` del modelo maestro (CU-02).
- Tools del agente LangChain que reutilizan `reservas.service`.
- MCP PostgreSQL (persistencia) y MCP Google Calendar (evento, fuera de alcance MVP).
- **Riesgos:** condiciones de carrera al reservar simultáneamente la misma franja → mitigar con validación transaccional; errores de red con Google Calendar → reintentos y estado de sincronización (CU-07).

## Technical Context

**Language/Version**: Backend Node.js (JavaScript); Frontend Next.js (App Router, TypeScript)

**Primary Dependencies**: ORM Prisma, LangChain.js (tools del agente), Tailwind CSS

**Storage**: PostgreSQL (acceso vía MCP local)

**Testing**: suite automatizada pendiente (CA-03.8); verificación en vivo observada; `node --check` (backend)

**Target Platform**: Web

**Project Type**: web-service + web application

**Performance Goals**: reserva transaccional sin solapamiento; latencia acotada por la consulta de disponibilidad

**Constraints**: fecha futura obligatoria; horario laboral obligatorio; escritura dentro de `$transaction`

**Scale/Scope**: un local; turnos diarios

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Spec antes que código**: PASS — spec fuente del plan, estado Implemented.
- **II. Gates secuenciales**: PASS — CA-03.3/CA-03.6/CA-03.7 fuera de alcance MVP y documentados; CA-03.8 (tests) pendiente.
- **III. Contratos primero**: PASS — request/response definidos en la spec; el chatbot reutiliza el mismo contrato.
- **IV. Testing obligatorio**: PASS CON PENDIENTE — no hay suite automatizada; se registra como deuda en CA-03.8.
- **V. Modularidad y capas**: PASS — validación de negocio en `turnos.service`, controller solo adapta HTTP; persistencia encapsulada vía MCP.

## Project Structure

### Documentation (this feature)

```text
specs/003-reserva-turnos/
├── plan.md
└── spec.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── routes/              # index.js, turnos.routes.js
│   ├── controllers/         # turnos.controller.js
│   ├── services/            # turnos.service.js, barberos.service.js
│   └── mcp/postgres/        # persistencia
└── tests/

frontend/
└── src/
    ├── app/reservar/        # page.tsx (wizard)
    └── components/
        ├── reservar/        # StepServicio, StepBarbero, StepFechaHora, StepConfirmacion
        ├── chat/            # ChatWidget
        └── ui/              # Stepper
```

**Structure Decision**: se preserva la estructura existente del backend (`routes/controllers/services`) y se agrega el wizard bajo `app/reservar`.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
