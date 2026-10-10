# spec-cu05-panel-barberos.md

> **Caso de Uso:** CU-05 — Panel de Barberos
> **Feature:** Agenda y gestión operativa del barbero
> **Rol autor:** Arquitecto / Tech Lead
> **Estado:** Backend implementado (agenda, estados, disponibilidad, métricas).
> **Metodología:** Spec-Driven Development — ver `IA_WORKFLOW.md` y `SDD.md`

---

## 1. Descripción

Ofrecer a cada barbero un panel para ver su agenda diaria/semanal, conocer los turnos asignados, actualizar su estado (confirmar, completar, marcar ausencia) y administrar su disponibilidad (horarios y días laborales).

**Actores:** Barbero (primario), Administrador (gestiona cualquier barbero).
**Alcance:** agenda del barbero, cambio de estado de turnos y edición de horarios. **Fuera de alcance:** gestión de pagos/liquidaciones, vacaciones (futuro).

---

## 2. Endpoints REST (Node.js)

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

---

## 3. Componentes de UI (Next.js + Tailwind)

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

---

## 4. Criterios de Aceptación

- [ ] **CA-05.1** Un barbero autenticado ve su agenda diaria y semanal con los turnos asignados.
- [ ] **CA-05.2** Un barbero puede marcar como `completado` un turno `confirmado` y como `confirmado` un turno `pendiente`.
- [ ] **CA-05.3** No se permiten transiciones de estado inválidas (ej. `completado` → `pendiente`); la UI las oculta y la API responde `409`.
- [ ] **CA-05.4** Un barbero solo puede modificar turnos asignados a él; sobre otros recibe `403`.
- [ ] **CA-05.5** Un barbero puede actualizar su horario y días laborales, y el cambio afecta la disponibilidad mostrada a los clientes (CU-03).
- [ ] **CA-05.6** El panel muestra métricas básicas del día/semana (turnos, completados, cancelados).
- [ ] **CA-05.7** Un administrador puede consultar/editar la agenda de cualquier barbero.
- [ ] **CA-05.8** Existe test del caso feliz y de al menos un caso de error por endpoint.

---

## 5. Dependencias

- Entidades `Barbero` y `Turno` del `SDD.md` (CU-03, CU-04).
- Consulta de disponibilidad de CU-03 (los cambios de horario la afectan).
- MCP PostgreSQL para persistencia de turnos y configuración.

## 6. Riesgos

- Coherencia entre la disponibilidad configurada y los turnos ya reservados.
- Control de permisos por asignación (evitar que un barbero edite turnos ajenos).
