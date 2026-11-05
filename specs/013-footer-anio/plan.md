# Implementation Plan: Año del pie de página sin actualización diferida

**Branch**: `013-footer-anio` | **Date**: 2026-10-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-footer-anio/spec.md`

## Summary

Reemplazar la actualización de estado dentro del efecto por una lectura del año en el cliente mediante `useSyncExternalStore`, con un snapshot de servidor de respaldo. Así se evita el error de lint y el error de prerender de Next.js 16 con Cache Components, sin cambiar el comportamiento visible. El cambio se limita a `frontend/src/components/layout/Footer.tsx` y se valida con lint, typecheck y build.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16.4

**Primary Dependencies**: Next.js App Router, Tailwind CSS 4, ESLint 9 con `eslint-config-next`

**Storage**: N/A

**Testing**: No hay runner de tests de frontend. Validación con `npm run lint`, `npx tsc --noEmit` y `npm run build` desde `frontend/`; si `next dev` comparte `.next`, el build se ejecuta en una copia aislada.

**Target Platform**: Aplicación web Next.js

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Eliminar el error de lint y el error de prerender, sin añadir lógica de servidor ni dependencias.

**Constraints**: Sin dependencias nuevas, sin cambios de contrato, sin cambios visuales y sin tocar backend ni datos.

**Scale/Scope**: Un componente de layout.

## Constitution Check

- **Spec antes que código**: la spec `013` y este plan se escriben antes de la implementación.
- **Contratos primero**: no se modifican contratos de API ni tipos compartidos.
- **Testing obligatorio**: se ejecutan lint, typecheck y build; no hay test de componente disponible.
- **Modularidad**: el cambio queda encapsulado en el componente del pie; no incorpora lógica de negocio.
- **Seguridad y datos**: no se accede a datos, secretos ni servicios externos.
- **Sin dependencias nuevas**: se reutiliza el stack existente.

Resultado: sin violaciones que justificar.

## Root Cause

`Footer` declara `"use client"`, mantiene el año en `useState(0)` y lo actualiza dentro de `useEffect` al montar. ESLint 9 con la regla `react-hooks/set-state-in-effect` detecta la actualización síncrona de estado dentro del efecto. Además, Next.js 16 con Cache Components prohíbe leer `new Date()` durante el prerender, tanto en Server Components como en Client Components.

## Approach

1. Mantener `"use client"` porque el año debe resolverse en el navegador.
2. Sustituir `useEffect` y `useState` por `useSyncExternalStore`:
   - `getServerSnapshot` devuelve una constante de respaldo.
   - `getSnapshot` devuelve el año actual en el cliente.
   - `subscribe` no se suscribe a nada porque el valor solo cambia con un nuevo renderizado.
3. Mantener sin cambios el marcado, las clases de Tailwind, el texto y los enlaces.
4. Validar lint, typecheck y build.

## Plan Revision (2026-10-26)

La primera versión del plan proponía convertir `Footer` en Server Component y calcular el año directamente. La verificación de build la invalidó:

- Server Component con `new Date()`: error `blocking-prerender-current-time` en `/_not-found`.
- Client Component con `new Date()` directo: error `blocking-prerender-current-time-client`.
- `useSyncExternalStore` con snapshot de servidor de respaldo: build de producción completado en la copia aislada.

Se adopta la tercera variante. El build de producción del repositorio no completó en el intento mientras el servidor de desarrollo activo usaba el mismo `.next`; se validó en una copia aislada.

## Alternatives Considered

| Alternativa | Motivo de rechazo |
|---|---|
| Server Component con `new Date()` directo | Falla el build de Next.js 16: valor inestable durante el prerender. |
| Client Component con `new Date()` directo | Falla con la variante cliente del mismo error de prerender. |
| Mantener `useEffect` con `setState` | Es la solución de Next.js para diferir la lectura, pero viola la regla de lint que motiva la feature. |
| Silenciar la regla con `eslint-disable` | Oculta el problema en lugar de corregirlo. |
| `useState` con inicializador perezoso | La lectura se ejecuta durante el prerender y falla igual que el cálculo directo. |
| Envolver el pie en `<Suspense>` y usar `connection()` | Convierte la ruta en dinámica o introduce streaming solo para mostrar un año; mayor impacto que el problema. |

## Project Structure

### Documentation

```text
specs/013-footer-anio/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code

```text
frontend/
└── src/
    └── components/
        └── layout/
            └── Footer.tsx    # único archivo de producción afectado
```

**Structure Decision**: se modifica un único componente existente del layout; no se crean carpetas ni módulos nuevos.

## Validation Strategy

Ejecutar desde `frontend/`, en este orden:

1. `npm run lint`: debe finalizar con código 0 y sin el error del pie. Las tres advertencias existentes pueden permanecer.
2. `npx tsc --noEmit`: debe finalizar sin errores.
3. `npm run build`: debe finalizar correctamente y renderizar el componente. Si el servidor de desarrollo activo comparte `.next`, ejecutar el build con Turbopack en una copia aislada con el mismo código y registrar la limitación.
4. Revisión del diff: solo `Footer.tsx` en código de producción y los documentos SDD.

Si un comando falla por una causa ajena a la feature, se registra como limitación y no se marca la tarea como aprobada.

## Risks

- **HTML inicial con año de respaldo**: antes de la hidratación, el servidor muestra la constante de respaldo; el cliente la corrige. El impacto visual es nulo en el año actual y acotado en un cambio de año.
- **Diferencia de zona horaria en el cambio de año**: el valor depende del navegador; el impacto es de un año calendario y no afecta la lógica de negocio.
- **Warnings preexistentes**: el lint puede seguir mostrando advertencias de otros archivos; no son errores y quedan fuera del alcance.
- **Build no completado en el repositorio**: con `next dev` activo, el intento de build no completó dentro del timeout y comparte `.next`; se valida en una copia aislada y se registra la limitación.

## Complexity Tracking

No hay violaciones constitucionales que justificar.
