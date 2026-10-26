# Propuestas de mejora — Proyecto Barbería

**Fecha:** 2026-10-26
**Rol:** Tech Lead
**Criterio de selección:** problema acotado, respaldado por evidencia reproducible, sin nuevas dependencias y verificable con herramientas ya instaladas.

---

## 1. Eliminar el error de ESLint del pie de página

**Estado:** Implementada en el ciclo SDD `013-footer-anio` (2026-10-26).

### Evidencia

Comando ejecutado desde `frontend/`:

```text
npm run lint
```

Resultado: `1 error` y `3 warnings`. El error está en `frontend/src/components/layout/Footer.tsx:18`:

```text
react-hooks/set-state-in-effect
Calling setState synchronously within an effect can trigger cascading renders
```

Los tres warnings corresponden a imports sin uso en `app/mis-turnos/page.tsx` y `components/turnos/TurnoCard.tsx`; quedan fuera de esta propuesta.

### Problema

El pie de página inicializa el año mediante un efecto que actualiza estado inmediatamente después del montaje. Next.js 16 con Cache Components no permite leer `new Date()` durante el prerender, por lo que la lectura debe diferirse al cliente; el efecto actual lo hace con una actualización de estado síncrona que hace fallar el lint del frontend.

### Alcance propuesto

- Corregir únicamente `frontend/src/components/layout/Footer.tsx`.
- Mantener el texto, los enlaces y la apariencia actual.
- Mostrar el año calendario actual en el cliente sin una actualización de estado síncrona dentro de un efecto.
- Evitar el error de prerender de `new Date()` en el build de Next.js 16.
- Verificar con lint, TypeScript y build del frontend.

### Fuera de alcance

- Los tres warnings de imports sin uso.
- Cambios de diseño, navegación o contenido del pie.
- Cualquier cambio de backend, datos, configuración o dependencias.

### Resultado

- Lint: 0 errores y 3 advertencias preexistentes.
- Typecheck: sin errores.
- Build: completado en copia aislada con Turbopack; el intento dentro del repositorio no completó con el servidor de desarrollo activo.
- HTTP: el pie responde con el año y los tres enlaces.
- Implementación: `useSyncExternalStore` con snapshot de servidor de respaldo, sin `setState` dentro de un efecto.

Ver `docs/sdd/REGISTRO_MEJORAS_SDD.md` para la evidencia completa y las limitaciones.
