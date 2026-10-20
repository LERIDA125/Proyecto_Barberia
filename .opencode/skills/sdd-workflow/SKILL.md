---
name: sdd-workflow
description: Use when working on any feature of the barbershop system, before writing implementation code, or when the user mentions spec, SDD, CU, gate, requerimientos, or asks to implement/plan a feature. Enforces the Spec-Driven Development pipeline of this project.
---

# SDD Workflow — Spec-Driven Development

Pipeline obligatorio del proyecto. Ninguna línea de código se escribe sin una especificación aprobada.

## Pipeline con gates

```
Requerimientos → Specs → Código → Testing
   (GATE 1)    (GATE 2)         (GATE 3/4)
```

El flujo es **estrictamente secuencial**. No se avanza al paso N+1 sin cerrar y verificar el paso N.

| Gate | Qué se produce | Artefacto versionado |
|------|----------------|----------------------|
| **GATE 1** | Requerimientos relevados y acordados con el usuario | Sección de contexto en la spec |
| **GATE 2** | Spec escrita y **aprobada** por el Tech Lead | `specs/spec-<feature>.md` |
| **GATE 3** | Implementación respetando el contrato | Código en `backend/` o `frontend/` |
| **GATE 4** | Verificación contra criterios de aceptación | Evidencia + `ESTADO.md` |

## Regla de corrección

Si un gate falla: **se detiene la codificación**, se vuelve a la spec, se corrige, y **recién entonces** se reimplementa. Nunca se "arregla en el código" algo que la spec define distinto.

Detalle completo en `IA_WORKFLOW.md` y tabla situación→acción en `.instructions.md`.

## Dónde vive cada cosa

| Necesidad | Archivo |
|-----------|---------|
| Índice maestro de specs | `specs/index.md` |
| Arquitectura, entidades, capas | `specs/SDD.md` |
| Spec de un caso de uso | `specs/spec-cu<NN>-<nombre>.md` |
| Spec de una feature extra | `specs/spec-<feature>.md` |
| Estado real del código por CU | `ESTADO.md` |
| Tracking de ejecución de una feature | `odd/tasks/<feature>.md` |
| Roles de la IA | `.opencode/agents/` |

## Cómo empezar una feature nueva

1. **Leé el índice** (`specs/index.md`) y verificá si la feature ya tiene spec.
2. **Leé la arquitectura maestra** (`specs/SDD.md`) para reutilizar entidades existentes antes de inventar nuevas.
3. **Revisá specs vecinas** — CU relacionados suelen definir contratos que necesitás respetar.
4. **Escribí la spec** con: caso de uso, contrato de API (request/response), modelo de datos afectado, criterios de aceptación verificables (`CA-<NN>.<M>`).
5. **Escalá al Tech Lead** si la spec cambia contratos existentes.

## Reglas duras

- **No inventes endpoints ni campos** que la spec no defina.
- **La lógica de negocio vive en `backend/src/services/`** — controllers y tools delegan.
- **El chatbot no es un camino alternativo:** reutiliza los mismos services que la API REST.
- **No modifiques `schema.prisma`** sin spec aprobada que lo respalde.
- **DoD:** código + tests + spec/estado actualizado. Sin los tres, la tarea no está hecha.
