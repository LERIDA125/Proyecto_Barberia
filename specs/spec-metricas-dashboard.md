# Spec — Métricas de negocio (dashboard)

> Estado: aprobada (09-S). Alcance: admin-only. Frontend: panel `/panel/metricas`.

## Objetivo

Darle al administrador una vista de métricas del negocio en un rango de fechas configurable: ingreso generado, ocupación de la agenda y los servicios más pedidos. No modifica el endpoint existente `GET /api/barberos/me/metricas` (cuenta por estado de un barbero).

## Endpoint

`GET /api/metricas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`

- Auth: `requiereAuth` + `requiereRol('admin')`. Cualquier otro rol → 403.
- Semántica de rango igual a `rangoFechas` de `barberos.service.js`: `desde`/`hasta` opcionales → hoy por defecto; `hasta` inclusive hasta las 23:59:59.999; `desde > hasta` → 400.

### Respuesta 200

```json
{
  "desde": "2026-10-01T00:00:00.000Z",
  "hasta": "2026-10-31T23:59:59.999Z",
  "turnos": {
    "total": 12,
    "porEstado": { "pendiente": 1, "confirmado": 2, "completado": 6, "cancelado": 2, "ausente": 1 }
  },
  "ingresos": { "completados": 6, "monto": 78000 },
  "ocupacion": { "turnos": 10, "horasOcupadas": 9.5, "horasDisponibles": 160, "porcentaje": 5.9 },
  "serviciosMasPedidos": [
    { "servicioId": "uuid", "nombre": "Corte", "cantidad": 4, "ingresos": 32000 }
  ]
}
```

## Reglas de cálculo

- `turnos.porEstado`: conteo por `estado` de turnos con `fechaInicio` en el rango; `total` = suma.
- `ingresos.monto`: Σ `servicio.precio` (convertido a `Number`) de turnos `completado` en el rango; `ingresos.completados` = cantidad de esos turnos. Solo `completado` cuenta como ingreso.
- `ocupacion.turnos`: cantidad de turnos con estado en `[pendiente, confirmado, completado, ausente]`.
- `ocupacion.horasOcupadas`: Σ `(fechaFin − fechaInicio)` en ms ÷ 3.600.000 de esos mismos turnos.
- `ocupacion.horasDisponibles`: Σ por barbero **activo** (`activo: true`) de las horas laborables por día (día ∈ `diasLaborales`), iterando cada día del rango inclusive; usar `getUTCHours` de `horarioInicio`/`horarioFin` (convención existente del repo).
- `ocupacion.porcentaje`: `horasDisponibles > 0 ? horasOcupadas / horasDisponibles * 100 : 0`, redondeado a 1 decimal.
- `serviciosMasPedidos`: top 5 por `cantidad` de turnos con estado ≠ `cancelado`, agrupados por `servicioId`; `ingresos` = Σ precio solo de `completado`; orden desc por cantidad, empate alfabético por nombre.

## Archivos backend

- nuevo `backend/src/services/metricas.service.js` (helper local `rangoFechas` espejo de semántica, sin acoplar a barberos.service)
- nuevo `backend/src/controllers/metricas.controller.js`
- nuevo `backend/src/routes/metricas.routes.js`
- editar `backend/src/routes/index.js` → `router.use('/metricas', metricasRoutes)`

## Frontend

- `frontend/src/types/api.ts`: interfaces `Metricas`, `MetricasIngresos`, `MetricasOcupacion`, `MetricasServicio` (o un solo tipo anidado).
- nuevo `frontend/src/lib/api/metricas.ts`: `getMetricas(params: { desde?: string; hasta?: string })`.
- nuevo `frontend/src/lib/hooks/useMetricas.ts`: patrón `firma` de `useTurnos`; recibe rango y `habilitado`.
- nuevo `frontend/src/app/panel/metricas/page.tsx`:
  - Gate admin igual que `configuracion/page.tsx` (`esAdmin`; no autorizado → `StatusMessage`; sin sesión → login).
  - Inputs `desde`/`hasta` (`type="date"`), por defecto primer día del mes actual → hoy; botón "Actualizar".
  - Cards de métricas con el estilo de `panel/page.tsx` (`border-neutral-800 bg-neutral-900 p-5`): Ingresos (`formatearPrecio`), Ocupación (`%`), Turnos total + desglose por estado.
  - Lista "Servicios más pedidos": rank con barra proporcional por `cantidad` usando `<div>` con ancho %, sin librería de charts.
  - Estados de loading (skeletons), error (`StatusMessage` + Reintentar), vacío (`EmptyState`), link "Volver al panel".
  - Copia UI en español, identificadores/inglés en código.
- editar `frontend/src/app/panel/page.tsx` `navItems`: agregar `{ href: "/panel/metricas", label: "Métricas" }` en el bloque admin (junto a Configuración).

## Criterios de aceptación

1. Admin ve métricas globales en el rango elegido; barbero y cliente reciben 403.
2. Ingresos contabiliza únicamente turnos `completado`.
3. Ocupación nunca divide por cero (0 si no hay capacidad).
4. Rango vacío → `serviciosMasPedidos: []`, todo en cero, sin errores.
5. Verificación: `node --check` (backend), `npx tsc --noEmit` y `npx eslint` sobre archivos frontend modificados.