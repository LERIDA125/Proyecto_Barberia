---
name: barberia-domain
description: Use when working with barbershop business rules — turnos, reservas, disponibilidad, bloqueos, solapes, horarios, servicios, barberos, precios, notificaciones, or the chatbot RAG. Contains the domain vocabulary and invariants that must be respected.
---

# Dominio — Sistema Integral de Barbería

Vocabulario e invariantes del negocio. Respetalos: son reglas, no sugerencias.

## Entidades centrales

| Entidad | Rol | Notas |
|---------|-----|-------|
| `Usuario` | Cliente o staff | Autenticado vía passkeys (WebAuthn), sin contraseñas |
| `CredencialPasskey` | Credencial WebAuthn | Relación `Usuario 1:N CredencialPasskey` |
| `Barbero` | Profesional que atiende | Tiene agenda propia y bloqueos |
| `Servicio` | Servicio ofrecido | Nombre, duración, precio. **Borrado lógico** (`activo`), nunca físico |
| `Turno` | Reserva | Tiene `notas` y `googleEventId`. Estados: `confirmado`, `en_curso`, `completado`, `ausente`, `cancelado` |
| `Bloqueo` | Franja no disponible del barbero | Ausencias, almuerzo, etc. Descuenta disponibilidad |
| `Notificacion` | Aviso in-app | Al cliente y al barbero ante cambios de estado |

## Horarios de atención (invariante de negocio)

- Lunes a Viernes: **10:00 a 20:00**
- Sábados: **10:00 a 18:00**
- Domingos y feriados: **cerrado**

Zona horaria del negocio: **`America/Argentina/Buenos_Aires`**. Todo cálculo de rango ("hoy", "próximos 30 días") se hace en esta zona, no en UTC.

## Invariantes de reserva (validaciones obligatorias)

Toda alta o reprogramación de turno debe validar:

1. **Solapamiento** — no puede haber dos turnos activos del mismo barbero en franjas que se pisan.
2. **Bloqueos** — la franja solicitada no puede caer dentro de un `Bloqueo` del barbero.
3. **Jornada laboral** — la franja debe estar dentro del horario de atención del día.
4. **Servicio activo** — no se puede reservar un servicio con `activo = false`.
5. **Ventana de cancelación** — existe `VENTANA_CANCELACION_HORAS` que limita hasta cuándo el cliente puede cancelar.

> **Estas validaciones viven en `backend/src/services/`** y son las mismas tanto para la API REST como para las tools del chatbot. No las dupliques.

## Estados de turno y transiciones

`confirmado` → `en_curso` → `completado`
Cualquier estado activo → `cancelado` (cliente o staff)
`confirmado` → `ausente` (marcado por el barbero)

La transición se valida en `PATCH /api/turnos/:id/estado`.

## Google Calendar (CU-07)

- La integración es **opt-in**: sin `MCP_CALENDAR_URL`, queda deshabilitada y los turnos se persisten igual.
- `googleEventId` null significa **sync pendiente**, no error.
- **Un fallo de Calendar nunca bloquea la persistencia del turno.** Resiliencia primero.
- El backend es **cliente MCP**; nunca llama a la API de Google directamente.

## Chatbot (CU-06)

- Arquitectura **RAG** sobre el catálogo (`datos_barberia.md` es la fuente).
- 4 tools: `consultar_disponibilidad`, `reservar_turno`, `consultar_mis_turnos`, `cancelar_turno`.
- Tool loop con autocorrección: máximo 5 iteraciones.
- **La fuente del RAG es `datos_barberia.md` en la raíz.** No la muevas — `ASISTENTE_DOC` y `backend/data/vector_db.json` la referencian por nombre.

## Fuente de verdad

- Reglas completas de negocio: `datos_barberia.md`
- Modelo de datos y relaciones: `specs/000-arquitectura/plan.md`
- Horarios, precios y catálogo: `datos_barberia.md`
