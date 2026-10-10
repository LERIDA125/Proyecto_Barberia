# IA_WORKFLOW.md

> Flujo de trabajo estricto del proyecto — **Spec-Driven Development (SDD)**.
> El código es una consecuencia de la especificación, nunca al revés.

---

## Principio Fundamental

**Ninguna línea de código se escribe sin una especificación aprobada.**

El flujo es estrictamente secuencial. No se puede avanzar al Paso N+1 sin haber cerrado y verificado el Paso N. Cada paso produce un **artefacto** que queda versionado en el repositorio.

```
[1. Requerimientos] → [2. SDD / Specs] → [3. Código] → [4. Testing & QA]
        │                    │                 │               │
   requerimiento.md     spec-<feat>.md     /src + tests    reporte-qa.md
        └──────────────────── gate ────────┴───────────────┘
```

---

## Paso 1 — Entender Requerimientos

**Objetivo:** Comprender el "qué" y el "para qué" antes de pensar en el "cómo".

**Actividades:**
- Reformular el requerimiento con mis propias palabras y confirmarlo con el usuario.
- Identificar: actores, casos de uso, reglas de negocio y restricciones.
- Detectar ambigüedades y huecos. **Preguntar antes de asumir.**
- Definir el alcance (in-scope) y lo que queda fuera (out-of-scope).
- Identificar dependencias (PostgreSQL, Google Calendar, LangChain) y riesgos.

**Artefacto de salida:** `/specs/requerimiento-<tema>.md`

**Checklist de cierre (GATE 1):**
- [ ] El requerimiento fue confirmado por el usuario.
- [ ] Casos de uso y reglas de negocio listados.
- [ ] Ambigüedades resueltas o marcadas explícitamente como supuestos.
- [ ] Alcance y fuera-de-alcance definidos.

> **No se avanza al Paso 2 sin GATE 1 aprobado.**

---

## Paso 2 — Generar SDD (Especificaciones)

**Objetivo:** Convertir el requerimiento en una especificación técnica implementable y testeable.

**Rol responsable:** Arquitecto / Tech Lead.

**Contenido obligatorio de cada spec (`/specs/spec-<feature>.md`):**

1. **Contexto y objetivo** — vínculo con el requerimiento.
2. **Historias de usuario / casos de uso.**
3. **Diseño técnico:**
   - Contratos de API (endpoint, método, request, response, códigos de error).
   - Modelo de datos afectado (tablas, relaciones, migraciones).
   - Componentes de frontend afectados.
4. **Integraciones:** tools de LangChain, operaciones MCP (PostgreSQL / Google Calendar).
5. **Reglas de negocio y validaciones.**
6. **Criterios de aceptación** — verificables y uno por uno (Gherkin opcional: Dado/Cuando/Entonces).
7. **Plan de pruebas** — qué se testea y cómo.
8. **Riesgos y supuestos.**

**Checklist de cierre (GATE 2):**
- [ ] La spec cubre todos los casos de uso del Paso 1.
- [ ] Los contratos de API están completos y tipados.
- [ ] Hay criterios de aceptación verificables.
- [ ] La spec fue revisada/aprobada por el usuario.
- [ ] Se descompuso el trabajo en tareas atómicas y ordenadas.

> **No se escribe código sin GATE 2 aprobado.**

---

## Paso 3 — Escribir Código basado SÓLO en la Spec

**Objetivo:** Implementar exactamente lo especificado, ni más ni menos.

**Rol responsable:** Backend Developer y/o Frontend Developer.

**Reglas del paso:**
- **La spec es la única fuente de verdad.** Si algo no está en la spec, no se implementa.
- Si durante la implementación se descubre que la spec es insuficiente o incorrecta: **detenerse, volver al Paso 2, actualizar la spec y recién luego codificar.**
- Implementar en tareas atómicas y pequeñas, en el orden definido en la spec.
- Mantener el código **modular**, tipado y con nombres descriptivos.
- No romper código existente: cambios mínimos y localizados.
- Actualizar la documentación/estado de la tarea a medida que se avanza.

**Artefacto de salida:** código en `/src` (o estructura definida) + nota de estado por tarea.

**Checklist de cierre (GATE 3):**
- [ ] Cada criterio de aceptación tiene su implementación correspondiente.
- [ ] No se agregó funcionalidad no especificada.
- [ ] El código compila / no tiene errores de lint.
- [ ] La spec fue actualizada si hubo cambios justificados.

---

## Paso 4 — Testing y QA

**Objetivo:** Verificar que la implementación cumple los criterios de aceptación y no rompe lo existente.

**Rol responsable:** quien implementó + revisión del Tech Lead.

**Actividades:**
- **Tests unitarios:** lógica de negocio, validaciones, utilidades.
- **Tests de integración:** endpoints, acceso a datos, integraciones MCP.
- **Tests de aceptación:** uno por cada criterio de aceptación de la spec.
- **Pruebas de regresión:** confirmar que nada previo se rompió.
- **QA funcional:** flujo de reserva, chatbot, sincronización con Google Calendar.
- Verificar manejo de errores, casos borde y estados de UI (carga/error/vacío).

**Artefacto de salida:** `/specs/reporte-qa-<feature>.md` con resultados.

**Checklist de cierre (GATE 4):**
- [ ] Todos los criterios de aceptación pasan.
- [ ] Tests unitarios/integración en verde.
- [ ] No hay regresiones.
- [ ] Se documentaron bugs, supuestos y limitaciones conocidas.
- [ ] La spec quedó marcada como **Implementada / Verificada**.

---

## Reglas de Oro del Flujo

1. **Sin spec, no hay código.**
2. **No se saltean gates.** Cada paso cierra antes de abrir el siguiente.
3. **Trazabilidad total:** tarea → spec → tests → criterio de aceptación.
4. **Si el requerimiento cambia, se vuelve al Paso 1.** La spec se actualiza, no se evade.
5. **Ante duda, preguntar.** Un supuesto no documentado es un bug futuro.
6. **Idioma:** toda documentación, spec y comunicación es en **español**.
