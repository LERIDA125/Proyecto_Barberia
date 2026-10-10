# spec-cu03-reserva-turnos.md

> **Caso de Uso:** CU-03 — Reserva de Turnos
> **Feature:** Flujo de reserva (UI y chatbot)
> **Rol autor:** Arquitecto / Tech Lead
> **Estado:** Aprobado e implementado
> **Metodología:** Spec-Driven Development — ver `IA_WORKFLOW.md` y `SDD.md`
> **Nota de alcance (MVP):** La sincronización con Google Calendar (CU-07) queda **fuera de alcance**. Al crear un turno se persiste solo con estado `confirmado` y `google_event_id = null` en PostgreSQL vía Prisma. La integración MCP externa se retomará cuando CU-07 se implemente.

---

## 1. Descripción

Permitir que un cliente reserve un turno seleccionando **servicio**, **barbero**, **fecha** y **hora disponible**, ya sea mediante el flujo guiado de la UI o conversando con el asistente (LangChain). Al confirmar, el turno se persiste en PostgreSQL. La sincronización con Google Calendar está fuera de alcance para el MVP (CU-07).

**Actores:** Cliente (primario), Asistente IA (vía tools), Administrador (puede reservar por un cliente).
**Alcance:** consulta de disponibilidad, creación y confirmación de turno. **Fuera de alcance:** pagos, seña/depósito, listas de espera, sincronización con Google Calendar (CU-07).

---

## 2. Endpoints REST (Node.js)

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

---

## 3. Componentes de UI (Next.js + Tailwind)

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

---

## 4. Criterios de Aceptación

- [x] **CA-03.1** Un cliente puede completar la reserva seleccionando servicio, barbero, fecha y hora disponible.
- [x] **CA-03.2** El sistema solo ofrece franjas realmente disponibles (sin solapamiento) para el barbero y fecha elegidos.
- [ ] **CA-03.3** ~~Al confirmar, el turno se persiste con estado `confirmado` y se crea el evento en Google Calendar (`google_event_id`).~~ *(Parcial en MVP: se persiste, pero `googleEventId` queda `null`. Pendiente de CU-07.)*
- [x] **CA-03.4** Un intento de reservar una franja ya ocupada responde `409` y la UI lo informa.
- [x] **CA-03.5** No se puede reservar en una fecha/hora pasada ni fuera del horario del barbero.
- [ ] **CA-03.6** El cliente puede reservar por lenguaje natural vía el asistente, obteniendo la misma validación que el flujo de UI. *(Pendiente de CU-06, Fase 2: tools del agente.)*
- [ ] **CA-03.7** ~~Si falla la sincronización con Google Calendar, el turno queda registrado y se informa el estado de sincronización pendiente.~~ *(Fuera de alcance en MVP; se persiste sin sync.)*
- [ ] **CA-03.8** Existe test del caso feliz y de al menos un caso de error (solapamiento) por endpoint. *(Pendiente: no hay suite automatizada en el repo.)*

---

## 4.1. Nota de implementación verificada (backend)

- **Endpoint:** `POST /api/turnos` (montado en `src/routes/index.js` → `src/routes/turnos.routes.js`) exige `requiereAuth`.
- **Controller:** `src/controllers/turnos.controller.js` — `crear()` resuelve `clienteId` (propio o del admin) y delega en el service.
- **Service:** `src/services/turnos.service.js` — `crear()` valida campos/UUIDs, fecha futura, existencia y `activo` de servicio/barbero/cliente, calcula `fechaFin = fechaInicio + servicio.duracionMin` (línea 63), valida horario laboral (`validarHorario`) y crea dentro de `$transaction` con chequeo de solapamiento (409).
- **Estado inicial:** `confirmado`; `google_event_id` queda `null` (sin MCP Google Calendar).
- **Verificado en vivo:** `201` en creación, `409` en solapamiento, `401` sin sesión, `200` en `/api/health`. Sin errores 404/500 en el flujo.

---

## 5. Dependencias

- Entidades `Turno`, `Barbero`, `Servicio` del `SDD.md` (CU-02).
- Tools del agente LangChain que reutilizan `reservas.service`.
- MCP PostgreSQL (persistencia) y MCP Google Calendar (evento).

## 6. Riesgos

- Condiciones de carrera al reservar simultáneamente la misma franja → mitigar con validación transaccional.
- Errores de red con Google Calendar → manejar reintentos y estado de sincronización.
