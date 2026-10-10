# spec-cu04-gestion-turnos-cliente.md

> **Caso de Uso:** CU-04 — Gestión de Turnos del Cliente
> **Feature:** Mis turnos: consulta, cancelación y reprogramación
> **Rol autor:** Arquitecto / Tech Lead
> **Estado:** Backend implementado (cancelación/reprogramación). Sincronización Google Calendar pendiente (CU-07).
> **Metodología:** Spec-Driven Development — ver `IA_WORKFLOW.md` y `SDD.md`

---

## 1. Descripción

Permitir que un cliente consulte sus turnos (próximos e históricos), cancele un turno y lo reprograme a otra franja disponible, manteniendo sincronizada la agenda de Google Calendar.

**Actores:** Cliente (dueño de sus turnos), Administrador (puede gestionar en nombre del cliente).
**Alcance:** listado, detalle, cancelación y reprogramación. **Fuera de alcance:** reembolsos, penalizaciones, transferencia de turno a otro cliente.

---

## 2. Endpoints REST (Node.js)

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

---

## 3. Componentes de UI (Next.js + Tailwind)

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

---

## 4. Criterios de Aceptación

- [ ] **CA-04.1** Un cliente ve únicamente sus propios turnos, separados en próximos e históricos.
- [ ] **CA-04.2** Un cliente puede cancelar un turno en estado `pendiente` o `confirmado` y el estado pasa a `cancelado`.
- [ ] **CA-04.3** Al cancelar se actualiza/elimina el evento correspondiente en Google Calendar.
- [ ] **CA-04.4** Un cliente puede reprogramar un turno a una franja disponible y el cambio se refleja en la agenda.
- [ ] **CA-04.5** No se puede cancelar/reprogramar un turno `completado` o ya `cancelado` (UI deshabilita y API responde `409`).
- [ ] **CA-04.6** Un usuario no puede operar sobre turnos de otro usuario (`403`).
- [ ] **CA-04.7** Intentar reprogramar a una franja ocupada responde `409` con mensaje claro.
- [ ] **CA-04.8** Existe test del caso feliz y de al menos un caso de error por endpoint.

---

## 5. Dependencias

- Entidad `Turno` del `SDD.md` (CU-03).
- MCP PostgreSQL (persistencia) y MCP Google Calendar (actualización del evento).
- Reutiliza la consulta de disponibilidad de CU-03.

## 6. Riesgos

- Consistencia entre el estado local del turno y el evento en Google Calendar (reintentos/compensación).
- Ventana mínima de cancelación: debe definirse como parámetro, no hardcodeada.
