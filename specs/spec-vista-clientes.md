# Spec — Vista de clientes

> Estado: aprobada (09-S). Alcance: barbero/admin. Frontend: panel `/panel/clientes`.

## Objetivo

Que la vista de clientes del panel liste **todos** los clientes (sin obligar a buscar), permita filtrar y ordenar en el cliente, y muestre el valor de cada cliente (tráfico y gasto acumulado) en su ficha.

## Backend

### 1. Nuevo `GET /api/clientes?limite=`

- Auth: `requiereAuth` + `requiereRol('barbero', 'admin')` (mismo patrón que `/buscar`).
- `limite` opcional: default 200, cap 500; inválido → 400.
- Implementación: `prisma.usuario.findMany({ where: { rol: 'cliente' }, orderBy: { nombre: 'asc' }, take: limite, include: { _count: { select: { turnos: true } } } })`, luego serializar.
- Respuesta 200: array

```json
[{ "id": "uuid", "nombre": "Ana", "email": "ana@x.com", "telefono": null, "activo": true, "totalTurnos": 7 }]
```

### 2. Extender `GET /api/clientes/:id/historial`

La respuesta actual (`{ cliente, turnos }`) gana un campo `resumen` calculado en JS sobre los turnos ya traídos (sin consultas nuevas):

```json
{ "totalTurnos": 7, "completados": 5, "totalGastado": 54000, "ultimaVisita": "2026-10-02T14:00:00.000Z" }
```

- `totalTurnos` = `turnos.length`; `completados` = conteo `estado === 'completado'`; `totalGastado` = Σ `servicio.precio` (Number) de completados; `ultimaVisita` = `turnos[0]?.fechaInicio ?? null` (la consulta ya ordena desc).

## Archivos backend

- editar `backend/src/services/clientes.service.js` → `listarClientes({ limite })` + `resumen` en `obtenerHistorialCliente`
- editar `backend/src/controllers/clientes.controller.js` → handler `listarClientes`
- editar `backend/src/routes/clientes.routes.js` → `router.get('/', ...)`

## Frontend

- `frontend/src/types/api.ts`: `Cliente.totalTurnos?: number`; `HistorialCliente.resumen: ResumenCliente | null` (interface nueva).
- editar `frontend/src/lib/api/clientes.ts`: `getClientes(limite?)`; conservar el resto.
- nuevo `frontend/src/lib/hooks/useClientes.ts`: patrón `firma`/`habilitado` de los hooks existentes; recarga con `Reintentar`.
- editar `frontend/src/components/panel/FichaCliente.tsx`: encabezado con `resumen` — Total turnos, Completados, Total gastado (`formatearPrecio`), Última visita (`formatearFechaHora`) — visible aunque no haya turnos; el historial sigue como está.
- editar `frontend/src/app/panel/clientes/page.tsx`:
  - Carga completa de clientes al montar; la lista deja de depender de tener ≥2 caracteres.
  - Filtro client-side en vivo (case-insensitive sobre `nombre` y `email`, sin mínimo de caracteres).
  - Orden client-side: **Nombre** | **Más turnos** (select).
  - Ítem de lista: nombre + email + badge de `totalTurnos` (ej: "7 turnos").
  - Estado vacío cuando el filtro no matchea vs. cuando no hay clientes.
  - No romper la ficha/historial existentes (siguen dependiendo de `/buscar` + `/:id/historial`).
  - Copia UI en español, identificadores en inglés.

## Criterios de aceptación

1. La lista carga completa sin requerir búsqueda previa.
2. Filtrar y ordenar funcionan en el cliente sin recargar.
3. La ficha muestra gasto total y última visita; `totalGastado` = 0 si no hay completados.
4. Barbero y admin acceden; cliente → 403.
5. Verificación: `node --check` (backend), `npx tsc --noEmit` y `npx eslint` sobre archivos frontend modificados.