---
name: sdd-workflow
description: Use when working on any feature of the barbershop system, before writing implementation code, or when the user mentions spec, Spec Kit, SDD, CU, gate, requerimientos, or asks to implement/plan a feature. Enforces the Spec Kit pipeline of this project.
---

# Spec Kit Workflow — Spec-Driven Development

Pipeline obligatorio del proyecto. Ninguna línea de código se escribe sin una especificación aprobada.

## Constitución

Los principios rectores y los gates viven en **`.specify/memory/constitution.md`**. Ese archivo es la autoridad: si esta skill y la constitución se contradicen, gana la constitución.

## Pipeline con gates

```
Requerimientos → Specs → Código → Testing
   (GATE 1)    (GATE 2)         (GATE 3/4)
```

El flujo es **estrictamente secuencial**. No se avanza al paso N+1 sin cerrar y verificar el paso N.

| Gate | Qué se produce | Artefacto versionado |
|------|----------------|----------------------|
| **GATE 1** | Requerimientos relevados y acordados con el usuario | Contexto en la spec |
| **GATE 2** | Spec escrita y **aprobada** por el Tech Lead | `specs/NNN-<feature>/spec.md` |
| **GATE 3** | Implementación respetando el contrato | Código en `backend/` o `frontend/` |
| **GATE 4** | Verificación contra criterios de aceptación | Evidencia + `ESTADO.md` |

## Comandos Spec Kit

| Comando | Uso |
|---------|-----|
| `/speckit.constitution` | Principios rectores del proyecto |
| `/speckit.specify` | Crear la spec de una feature (el "qué") |
| `/speckit.plan` | Generar el plan técnico (el "cómo") |
| `/speckit.tasks` | Descomponer en tareas accionables |
| `/speckit.implement` | Ejecutar la implementación |
| `/speckit.clarify` | Resolver ambigüedades antes de planificar |
| `/speckit.analyze` | Verificar consistencia entre artefactos |
| `/speckit.checklist` | Generar checklists de calidad |

## Separación qué / cómo

| Artefacto | Contenido | Debe ser |
|-----------|-----------|----------|
| `spec.md` | Historias de usuario, requisitos funcionales (FR-###), criterios de éxito (SC-###), supuestos | **Technology-agnostic** — sin endpoints, sin archivos, sin librerías |
| `plan.md` | Endpoints, componentes, stack, estructura de carpetas, decisiones técnicas | **Técnico** — el detalle de implementación |

Nunca mezcles detalle de implementación en `spec.md`. Si lo hacés, Spec Kit no puede operar sobre la spec.

## Regla de corrección

Si un gate falla: **se detiene la codificación**, se vuelve a la spec, se corrige, y **recién entonces** se reimplementa. Nunca se "arregla en el código" algo que la spec define distinto.

Detalle en `.specify/memory/constitution.md` y tabla situación→acción en `.instructions.md`.

## Dónde vive cada cosa

| Necesidad | Archivo |
|-----------|---------|
| Constitución y gates | `.specify/memory/constitution.md` |
| Índice maestro de specs | `specs/index.md` |
| Arquitectura, entidades, capas | `specs/000-arquitectura/plan.md` |
| Spec de una feature (el "qué") | `specs/NNN-<feature>/spec.md` |
| Plan técnico de una feature (el "cómo") | `specs/NNN-<feature>/plan.md` |
| Templates de Spec Kit | `.specify/templates/` |
| Estado real del código por CU | `ESTADO.md` |
| Tracking de ejecución de una feature | `specs/NNN-<feature>/tasks.md` |
| Roles de la IA | `.opencode/agents/` |

## Cómo empezar una feature nueva

1. **Leé el índice** (`specs/index.md`) y verificá si la feature ya tiene spec.
2. **Leé la arquitectura maestra** (`specs/000-arquitectura/plan.md`) para reutilizar entidades existentes antes de inventar nuevas.
3. **Revisá specs vecinas** — CU relacionados suelen definir contratos que necesitás respetar.
4. **Creá la spec** con `/speckit.specify` (el "qué"), el plan con `/speckit.plan` (el "cómo") y las tareas con `/speckit.tasks` (descomposición atómica en `specs/NNN-<feature>/tasks.md`).
5. **Implementá** siguiendo el `tasks.md`, con tests por tarea. El tracking de la ejecución vive en ese mismo `tasks.md`.
6. **Escalá al Tech Lead** si la spec cambia contratos existentes.

> **Deuda documentada:** las features 001-012 se implementaron sin `/speckit.tasks` y no tienen `tasks.md` (ver `ESTADO.md`). No se hace backfill; aplica desde la próxima feature.

## Reglas duras

- **No inventes endpoints ni campos** que la spec no defina.
- **La lógica de negocio vive en `backend/src/services/`** — controllers y tools delegan.
- **El chatbot no es un camino alternativo:** reutiliza los mismos services que la API REST.
- **No modifiques `schema.prisma`** sin spec aprobada que lo respalde.
- **No pongas detalle de implementación en `spec.md`** — eso va en `plan.md`.
- **DoD:** código + tests + spec/estado actualizado. Sin los tres, la tarea no está hecha.
