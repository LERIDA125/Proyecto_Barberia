# spec-cu10-notificaciones-estado.md

> **Caso de Uso:** CU-10 — Notificaciones de Estado de Turno
> **Feature:** Notificaciones y recordatorios
> **Rol autor:** Arquitecto / Tech Lead
> **Estado:** Borrador para revisión
> **Metodología:** Spec-Driven Development — ver `IA_WORKFLOW.md` y `SDD.md`

---

## 1. Descripción

Notificar a los actores cuando cambia el estado de un turno (confirmado, reprogramado, cancelado, completado) y enviar **recordatorios** previos a la cita. Las notificaciones pueden ser **internas** (centro de notificaciones en la UI) y **externas** (email).

**Actores:** Cliente, Barbero (receptores).
**Alcance:** generación, listado y marcado como leídas; recordatorio previo. **Fuera de alcance:** SMS/WhatsApp (futuro), plantillas personalizables avanzadas.

---

## 2. Endpoints REST (Node.js)

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

---

## 3. Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `NotificationBell` | `components/layout/NotificationBell.tsx` | Ícono con contador de no leídas. |
| `NotificationCenter` | `components/notificaciones/NotificationCenter.tsx` | Panel/dropdown con la lista. |
| `NotificationItem` | `components/notificaciones/NotificationItem.tsx` | Ítem individual con acción de leer. |
| `Toast` | `components/ui/Toast.tsx` | Aviso inmediato ante cambios de estado (reutilizable). |
| `PreferenciasNotificacionForm` | `components/notificaciones/PreferenciasNotificacionForm.tsx` | Configuración de preferencias. |
| `useNotificaciones` | `lib/hooks/useNotificaciones.ts` | Hook para estado, contador y marcado como leídas. |

**Estados de UI:** sin notificaciones, con no leídas, carga, error de envío.

---

## 4. Criterios de Aceptación

- [ ] **CA-10.1** Al confirmar, reprogramar o cancelar un turno, se genera una notificación para el cliente y el barbero.
- [ ] **CA-10.2** La UI muestra un contador de notificaciones no leídas que se actualiza al marcarlas.
- [ ] **CA-10.3** Un usuario puede marcar una o todas sus notificaciones como leídas.
- [ ] **CA-10.4** Un usuario no puede leer ni modificar notificaciones de otro (`403`).
- [ ] **CA-10.5** El sistema envía un recordatorio al cliente `horasAntes` antes del turno según sus preferencias.
- [ ] **CA-10.6** El usuario puede activar/desactivar notificaciones por email y recordatorios.
- [ ] **CA-10.7** Si el envío de email falla, la notificación interna se conserva y el error se registra sin romper el flujo.
- [ ] **CA-10.8** Existe test del caso feliz y de un caso de error por endpoint.

---

## 5. Dependencias

- Entidad `Turno` del `SDD.md`; CU-03 y CU-04 (generan eventos de estado).
- Requiere nuevas entidades de dominio: **Notificacion, PreferenciaNotificacion** (escalar al SDD).
- Proveedor de email (a definir por el Tech Lead) y job de recordatorios.

## 6. Riesgos

- Envío duplicado de notificaciones → idempotencia por `turnoId` + tipo de evento.
- Recordatorios con zona horaria incorrecta → usar timestamps absolutos y `TIMEZONE` del sistema.
- Privacidad: no incluir datos sensibles en el cuerpo del email.
