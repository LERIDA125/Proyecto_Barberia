# Registro de mejoras SDD — Proyecto Barbería

**Fecha:** 2026-10-26
**Rol:** Tech Lead + Frontend
**Feature:** `013-footer-anio`
**Estado:** Implementada con verificación parcial del build en el repositorio

---

## 1. Problema y evidencia inicial

Comando ejecutado desde `frontend/` antes del cambio:

```text
npm run lint
```

Resultado:

```text
1 error, 3 warnings
frontend/src/components/layout/Footer.tsx:18:5
react-hooks/set-state-in-effect
```

El pie de página usaba `useState(0)` y `useEffect` para asignar el año después del montaje. La regla de ESLint detecta la actualización síncrona de estado dentro del efecto. Además, Next.js 16 con Cache Components no permite leer `new Date()` durante el prerender.

## 2. Documentación creada antes de implementar

- `specs/013-footer-anio/spec.md`: problema, alcance, historias, requisitos y criterios de aceptación.
- `specs/013-footer-anio/plan.md`: causa raíz, enfoque, alternativas, validación y riesgos.
- `specs/013-footer-anio/tasks.md`: tareas atómicas, dependencias y criterios de finalización.
- `docs/sdd/PROPUESTAS_MEJORA.md`: evidencia y alcance de la propuesta.
- `specs/index.md`: alta de la feature y actualización de la matriz de trazabilidad.

## 3. Revisión del plan por evidencia de build

La primera versión del plan proponía convertir el pie en Server Component y calcular el año directamente. El build la descartó:

1. **Server Component con `new Date()`:** error `blocking-prerender-current-time` al prerenderizar `/_not-found`.
2. **Client Component con `new Date()` directo:** error `blocking-prerender-current-time-client`.
3. **`useSyncExternalStore` con snapshot de servidor de respaldo:** build de producción completado.

La causa raíz se corrigió en `plan.md` antes de cerrar la implementación. La solución final no elimina el componente cliente: difiere la lectura del año al cliente y evita el `setState` dentro del efecto.

## 4. Implementación

Archivo de producción modificado:

- `frontend/src/components/layout/Footer.tsx`

Cambios:

- Se reemplazó `useEffect` + `useState` por `useSyncExternalStore`.
- `getServerSnapshot` devuelve la constante de respaldo `2026` durante el prerender.
- `getSnapshot` devuelve el año actual en el navegador.
- `subscribe` no registra suscripciones porque el valor solo cambia con un nuevo renderizado.
- Se conservaron el texto, las clases de Tailwind y los enlaces a `/servicios`, `/reservar` y `/mis-turnos`.

No se modificaron backend, base de datos, contratos de API, dependencias ni configuración de entorno.

## 5. Verificación ejecutada

### Lint

```text
npm run lint
```

Resultado final: **0 errores, 3 advertencias**. Código de salida 0.

Las tres advertencias son preexistentes y quedan fuera del alcance:

- `frontend/src/app/mis-turnos/page.tsx`: `Card` y `EmptyState` sin uso.
- `frontend/src/components/turnos/TurnoCard.tsx`: `formatearHora` sin uso.

### Typecheck

```text
npx tsc --noEmit
```

Resultado: sin errores.

### Build

```text
npm run build
```

- Ejecución en el repositorio: no completó; el comando se detuvo por timeout a los 300 s mientras el servidor de desarrollo activo en `:3001` usaba el mismo directorio `.next`.
- Ejecución en copia aislada del frontend con Turbopack: **completada**, 13/13 páginas generadas.
- La copia usó el mismo código, configuración, variables locales y `node_modules`; solo se agregó `turbopack.root` para resolver el enlace de dependencias fuera del directorio temporal.
- También se completó un build alternativo con webpack en la misma copia.

Limitación registrada: el build de producción no se ejecutó de punta a punta dentro del repositorio porque detener el servidor de desarrollo no estaba autorizado.

### Verificación HTTP

```text
GET http://localhost:3001
```

Resultado:

- Estado HTTP 200.
- HTML con `2026<!-- --> Barbería. Todos los derechos reservados.`
- Enlaces presentes: `/servicios`, `/reservar`, `/mis-turnos`.

Limitación: no se verificó la hidratación en un navegador real; el HTML servido muestra el snapshot de respaldo y el cliente lo actualiza tras hidratar.

## 6. Tareas

- T001-T003: completadas antes de implementar.
- T004-T007: completadas en `Footer.tsx`.
- T008: lint sin errores.
- T009: typecheck sin errores.
- T010: build validado en copia aislada; el intento en el repositorio no completó con el servidor de desarrollo activo.
- T011: HTML y enlaces verificados por HTTP.
- T012-T014: registro y documentación de estado actualizados.

## 7. Limitaciones y deuda restante

- Las tres advertencias de lint de otros archivos siguen abiertas.
- No hay test automatizado de componentes ni de hidratación.
- El año del HTML inicial es un valor de respaldo; el valor definitivo se resuelve en el cliente.
- El build dentro del repositorio queda pendiente de una ejecución con el servidor de desarrollo detenido.
- No se crearon commits ni se hizo push.

## 8. Archivos relevantes

- `frontend/src/components/layout/Footer.tsx` — implementación final.
- `specs/013-footer-anio/spec.md` — requisitos y criterios.
- `specs/013-footer-anio/plan.md` — plan y revisión por evidencia de build.
- `specs/013-footer-anio/tasks.md` — seguimiento de tareas.
- `docs/sdd/PROPUESTAS_MEJORA.md` — propuesta inicial.
- `specs/index.md` — índice y trazabilidad.
- `docs/sdd/ESTADO_DOCUMENTACION_SDD.md` — inventario documental actualizado.
- `ESTADO.md` — estado del proyecto actualizado.
