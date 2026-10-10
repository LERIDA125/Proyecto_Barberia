# spec-cu08-gestion-disponibilidad.md

> **Caso de Uso:** CU-08 — Gestión de Disponibilidad y Ausencias
> **Feature:** Motor de disponibilidad, bloqueos y excepciones
> **Rol autor:** Arquitecto / Tech Lead
> **Estado:** Borrador para revisión
> **Metodología:** Spec-Driven Development — ver `IA_WORKFLOW.md` y `SDD.md`

---

## 1. Descripción

Definir y gestionar las reglas que determinan **qué franjas horarias están disponibles** para reservar: horarios laborales por barbero, bloqueos puntuales (ausencias, descansos, feriados) y excepciones de fecha. Este CU es la base de CU-03 (reserva) y complementa CU-05 (panel del barbero).

**Actores:** Barbero (gestiona lo propio), Administrador (gestiona a cualquiera y feriados globales).
**Alcance:** generar disponibilidad, crear/editar bloqueos y excepciones. **Fuera de alcance:** plantillas de turnos recurrentes complejas, integración con festivos externos.

---

## 2. Endpoints REST (Node.js)

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

---

## 3. Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `DisponibilidadPage` | `app/barberos/disponibilidad/page.tsx` | Vista de horarios y bloqueos del barbero. |
| `HorarioSemanalEditor` | `components/barberos/HorarioSemanalEditor.tsx` | Editor de días/horas laborales. |
| `BloqueoForm` | `components/barberos/BloqueoForm.tsx` | Alta de bloqueo con rango y motivo. |
| `BloqueoList` | `components/barberos/BloqueoList.tsx` | Lista de bloqueos con eliminar. |
| `DisponibilidadPreview` | `components/barberos/DisponibilidadPreview.tsx` | Previsualización de franjas resultantes. |
| `FechaRangePicker` | `components/ui/FechaRangePicker.tsx` | Selección de rango de fechas (reutilizable). |

**Estados de UI:** carga, sin horarios configurados, sin bloqueos, advertencia de solapamiento.

---

## 4. Criterios de Aceptación

- [ ] **CA-08.1** El sistema calcula la disponibilidad real combinando horario, turnos, bloqueos y feriados.
- [ ] **CA-08.2** Un barbero puede definir sus días y horas laborales y el resultado afecta la disponibilidad pública.
- [ ] **CA-08.3** Un barbero puede crear y eliminar bloqueos (ausencias/descansos) por rango de fecha.
- [ ] **CA-08.4** Un bloqueo que se solape con turnos confirmados advierte antes de guardar (`409`).
- [ ] **CA-08.5** Se rechazan horarios inválidos (`inicio >= fin`) y días fuera de rango.
- [ ] **CA-08.6** Un administrador puede registrar feriados globales que restan disponibilidad a todos.
- [ ] **CA-08.7** La disponibilidad ofrecida en CU-03 refleja exactamente el resultado de este motor.
- [ ] **CA-08.8** Existe test del caso feliz y de un caso de error por endpoint.

---

## 5. Dependencias

- Entidades `Barbero` y `Turno` del `SDD.md`; CU-03 y CU-05.
- Requiere nuevas entidades de dominio: **HorarioLaboral, Bloqueo y Feriado** (escalar al SDD).
- MCP PostgreSQL para persistencia.

## 6. Riesgos

- Cambiar horarios con turnos ya reservados → validar y advertir.
- Cálculo de franjas y zona horaria → centralizar en un único `disponibilidad.service` para evitar divergencias.
