# spec-cu02-catalogo-servicios.md

> **Caso de Uso:** CU-02 — Gestión del Catálogo de Servicios
> **Feature:** Catálogo de servicios de la barbería
> **Rol autor:** Arquitecto / Tech Lead
> **Estado:** Backend y Frontend (catálogo público + gestión admin) implementados.
> **Metodología:** Spec-Driven Development — ver `IA_WORKFLOW.md` y `SDD.md`

---

## 1. Descripción

Permitir la administración del catálogo de servicios (nombre, descripción, duración y precio) y su consulta pública para que los clientes conozcan qué se ofrece antes de reservar.

**Actores:** Administrador (crea/edita/desactiva), Cliente y Barbero (consultan).
**Alcance:** CRUD de servicios y listado público. **Fuera de alcance:** promociones, combos, impuestos.

---

## 2. Endpoints REST (Node.js)

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

---

## 3. Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `ServiciosPage` | `app/servicios/page.tsx` | Vista de catálogo (pública) y administración según rol. |
| `ServicioCard` | `components/servicios/ServicioCard.tsx` | Tarjeta con nombre, duración y precio; acción "Reservar". |
| `ServicioForm` | `components/servicios/ServicioForm.tsx` | Formulario de alta/edición con validaciones. |
| `ServicioFormModal` | `components/servicios/ServicioFormModal.tsx` | Modal que envuelve `ServicioForm` para crear/editar. |
| `ConfirmDeleteDialog` | `components/ui/ConfirmDeleteDialog.tsx` | Confirmación antes de desactivar (reutilizable). |
| `EmptyState` | `components/ui/EmptyState.tsx` | Mensaje cuando no hay servicios (reutilizable). |

**Estados de UI:** carga (skeleton), error, vacío, éxito; deshabilitado del formulario mientras guarda.

---

## 4. Criterios de Aceptación

- [ ] **CA-02.1** Un visitante ve todos los servicios activos con nombre, duración y precio.
- [ ] **CA-02.2** Un administrador puede crear un servicio y aparece inmediatamente en el catálogo.
- [ ] **CA-02.3** No se permite crear/editar con `nombre` vacío, `duracionMin <= 0` ni `precio < 0` (validación en UI y API).
- [ ] **CA-02.4** No se permite duplicar el `nombre` de un servicio (`409`).
- [ ] **CA-02.5** Editar un servicio actualiza sus datos sin afectar los turnos ya existentes.
- [ ] **CA-02.6** Desactivar (DELETE) oculta el servicio del catálogo público pero conserva el historial de turnos.
- [ ] **CA-02.7** Un usuario sin rol admin no puede acceder a las operaciones de escritura (`403`).
- [ ] **CA-02.8** Existe test del caso feliz y de al menos un caso de error por endpoint.

---

## 5. Dependencias

- Entidad `Servicio` del `SDD.md`.
- Persistencia vía MCP PostgreSQL local.
- Relación con CU-03 (los servicios son seleccionables al reservar).

## 6. Riesgos

- Desactivar un servicio referenciado por turnos futuros: resolver conservando historial (borrado lógico).
