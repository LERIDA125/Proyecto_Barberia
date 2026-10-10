# spec-cu09-historial-visitas.md

> **Caso de Uso:** CU-09 — Historial de Visitas y Fichas de Cliente
> **Feature:** Registro histórico de turnos y preferencias
> **Rol autor:** Arquitecto / Tech Lead
> **Estado:** Borrador para revisión
> **Metodología:** Spec-Driven Development — ver `IA_WORKFLOW.md` y `SDD.md`

---

## 1. Descripción

Permitir que el cliente consulte el **historial de sus visitas** (turnos completados) y que el barbero/admin vea la **ficha e historial** de un cliente, incluyendo servicios recibidos, frecuencia y notas. Sirve como insumo para métricas (CU-05) y atención personalizada.

**Actores:** Cliente (ve su historial), Barbero/Admin (ven fichas de clientes).
**Alcance:** consulta de historial y ficha de cliente. **Fuera de alcance:** fidelización/puntos, programas de recompensas.

---

## 2. Endpoints REST (Node.js)

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| `GET` | `/api/clientes/me/historial` | Historial de visitas del cliente autenticado (`?desde=&hasta=`). | Cliente |
| `GET` | `/api/clientes/me/ficha` | Datos y preferencias del propio cliente. | Cliente |
| `PATCH` | `/api/clientes/me/ficha` | Actualiza datos/observaciones propias. | Cliente |
| `GET` | `/api/clientes` | Búsqueda/listado de clientes (para staff). | Barbero / Admin |
| `GET` | `/api/clientes/:id/historial` | Historial de visitas de un cliente (staff). | Barbero / Admin |
| `GET` | `/api/clientes/:id/ficha` | Ficha completa de un cliente. | Barbero / Admin |

**Contratos (alto nivel):**
- `historial` ⇒ `Turno[]` completados con `{ fecha, servicio, barbero, importe? }` y contadores (`totalVisitas`, `ultimaVisita`).
- `ficha` ⇒ `{ cliente, preferencias, observaciones, historialReciente[] }`.

**Reglas de negocio:**
- Solo el propio cliente o el staff autorizado accede al historial.
- El historial se construye a partir de turnos en estado `completado`.
- Las `observaciones` de la ficha son visibles para el staff (no para otros clientes).

**Errores esperados:** `403` sin permiso, `404` cliente inexistente, `400` filtros de fecha inválidos.

---

## 3. Componentes de UI (Next.js + Tailwind)

| Componente | Ruta propuesta | Descripción |
|------------|----------------|-------------|
| `MiHistorialPage` | `app/mis-turnos/historial/page.tsx` | Historial del cliente con filtros por fecha. |
| `HistorialTimeline` | `components/clientes/HistorialTimeline.tsx` | Línea de tiempo de visitas. |
| `VisitaItem` | `components/clientes/VisitaItem.tsx` | Ítem de visita (fecha, servicio, barbero). |
| `ClientesPage` | `app/clientes/page.tsx` | Listado/búsqueda de clientes (staff). |
| `ClienteFicha` | `components/clientes/ClienteFicha.tsx` | Ficha con datos, preferencias y observaciones. |
| `ResumenContadores` | `components/clientes/ResumenContadores.tsx` | Total de visitas, última visita, frecuencia. |
| `EmptyState` | `components/ui/EmptyState.tsx` | Sin visitas aún (reutilizable). |

**Estados de UI:** carga (skeleton), sin historial, error, paginación/scroll infinito.

---

## 4. Criterios de Aceptación

- [ ] **CA-09.1** Un cliente ve su historial de visitas completadas en orden cronológico.
- [ ] **CA-09.2** El historial muestra contadores: total de visitas y fecha de la última.
- [ ] **CA-09.3** Un cliente puede filtrar su historial por rango de fechas.
- [ ] **CA-09.4** El staff puede buscar un cliente y ver su ficha e historial.
- [ ] **CA-09.5** Un cliente no puede ver el historial ni la ficha de otro cliente (`403`).
- [ ] **CA-09.6** Las observaciones de la ficha solo son visibles para el staff autorizado.
- [ ] **CA-09.7** Solo los turnos `completado` aparecen en el historial de visitas.
- [ ] **CA-09.8** Existe test del caso feliz y de un caso de error por endpoint.

---

## 5. Dependencias

- Entidades `Usuario` y `Turno` del `SDD.md`; CU-04 y CU-05.
- Requiere campos de **ficha/observaciones** del cliente (escalar al SDD).
- MCP PostgreSQL para consultas históricas.

## 6. Riesgos

- Volumen de historial → paginación e índices por `cliente_id` y `fecha`.
- Privacidad de datos personales → control estricto de acceso.
