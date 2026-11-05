# Estado de la documentación SDD — Proyecto Barbería

**Fecha de inventario:** 2026-10-26
**Rol:** Arquitecto / Tech Lead
**Alcance:** documentación Spec Kit existente, faltante e inconsistencias. No se modificó código de producción ni se ejecutaron pruebas de datos.
**Método:** lectura de `specs/`, `.specify/memory/constitution.md`, `AGENTS.md`, `.instructions.md`, `opencode.json`, `README.md`, `ESTADO.md` y `specs/index.md`.

---

## 1. Inventario de especificaciones

| Feature | Título | `spec.md` | `plan.md` | `tasks.md` | Estado de implementación declarado |
|---|---|:---:|:---:|:---:|---|
| `000-arquitectura` | Arquitectura del Sistema de Barbería | Sí | Sí | Sí | Implemented |
| `001-registro-passkeys` | Registro y Autenticación con Passkeys | Sí | Sí | Sí | Implemented |
| `002-catalogo-servicios` | Catálogo de Servicios | Sí | Sí | Sí | Implemented |
| `003-reserva-turnos` | Reserva de Turnos | Sí | Sí | Sí | Implemented |
| `004-gestion-turnos-cliente` | Gestión de Turnos del Cliente | Sí | Sí | Sí | Implemented |
| `005-panel-barberos` | Panel de Barberos | Sí | Sí | Sí | Implemented |
| `006-chatbot-langchain` | Asistente Conversacional (LangChain + RAG) | Sí | Sí | Sí | Partial |
| `007-sync-calendario-mcp` | Sincronización con Google Calendar (MCP) | Sí | Sí | Sí | Partial |
| `008-gestion-disponibilidad` | Gestión de Disponibilidad y Ausencias | Sí | Sí | Sí | Partial |
| `009-historial-visitas` | Historial de Visitas (Fichas de Cliente) | Sí | Sí | Sí | Partial |
| `010-notificaciones-estado` | Notificaciones de Estado de Turno | Sí | Sí | Sí | Partial |
| `011-metricas-dashboard` | Dashboard de Métricas de Negocio | Sí | Sí | Sí | Implemented |
| `012-vista-clientes` | Vista de Clientes | Sí | Sí | Sí | Implemented |
| `013-footer-anio` | Año del pie de página sin actualización diferida | Sí | Sí | Sí | Implemented |
| `014-chat-reinicio-conversacion` | Reinicio de conversación del asistente (incremento de FR-008) | Sí | Sí | Sí | Partial |

**Totales verificados:**

- 15 `spec.md`.
- 15 `plan.md`.
- **15 `tasks.md`**: 13 reconstruidos en el backfill documental del 2026-10-26 y 2 creados para incrementos SDD (`013-footer-anio`, `014-chat-reinicio-conversacion`).

---

## 2. Documentos existentes y faltantes

### 2.1 Existentes

| Documento | Rol | Estado |
|---|---|---|
| `.specify/memory/constitution.md` | Principios, 4 gates, restricciones, roles y governance | Vigente |
| `specs/index.md` | Índice de features y trazabilidad | Vigente, con enlaces a `tasks.md` y nota de backfill |
| `docs/sdd/ESTADO_DOCUMENTACION_SDD.md` | Inventario y estado de la documentación SDD | Este documento |
| `specs/000-arquitectura/spec.md` + `plan.md` + `tasks.md` | Arquitectura maestra, modelo de datos y tareas | Completos |
| `specs/001..012/spec.md` + `plan.md` + `tasks.md` | Especificaciones, planes y tareas por feature | Completos (backfill 26-oct-2026) |
| `specs/013-footer-anio/spec.md` + `plan.md` + `tasks.md` | Ciclo SDD de la mejora del pie de página | Completo; implementación y validación registradas |
| `specs/014-chat-reinicio-conversacion/spec.md` + `plan.md` + `tasks.md` | Incremento de FR-008 de 006 | Implementación, tests de backend, lint y TypeScript registrados; verificación manual del navegador pendiente |
| `docs/sdd/PROPUESTAS_MEJORA.md` | Propuesta respaldada por evidencia de lint | Vigente |
| `docs/sdd/REGISTRO_MEJORAS_SDD.md` | Evidencia, resultados y limitaciones de la mejora 013 | Vigente |
| `README.md` | Presentación, stack, CU, AI Engineering, MCP, instalación | Extenso |
| `ESTADO.md` | Auditoría de estado por feature y deuda técnica | Vigente |
| `AGENTS.md` | Roles de la IA y reglas de coordinación | Vigente |
| `.instructions.md` | Reglas de oro del proyecto | Vigente |
| `.opencode/agents/` | Agentes `arquitecto`, `backend`, `frontend` | Presentes |
| `.opencode/commands/speckit.*` | 10 comandos Spec Kit | Presentes |
| `opencode.json` | Instrucciones y MCPs declarados | Presente |
| `datos_barberia.md` | Fuente del RAG | Presente, con contradicción conocida |

### 2.2 Faltantes

| Documento | Por qué falta | Impacto |
|---|---|---|
| Documento de definición del TP | No está en el repositorio | Faltan datos de integrantes, emails, usuarios de GitHub y consigna desarrollada |
| Evidencia de prompts y ciclos de autocorrección | El README describe la metodología, pero no muestra transcripciones | Difícil demostrar el proceso de ingeniería de IA |
| Evidencia de pruebas end-to-end | No hay resultados de smoke test ni capturas | No se puede afirmar que los CU funcionen end-to-end |

---

## 3. Inconsistencias relevantes

| Inconsistencia | Evidencia | Acción propuesta |
|---|---|---|
| `README.md` afirma "todos los CU funcionales" | Contradice `ESTADO.md`, que marca 006-010 como `Partial` | Resuelto: el README distingue CU completos y parciales |
| `specs/008`, `009`, `010` declaran `Status: Implemented` | `ESTADO.md` y `specs/index.md` las marcan `Partial` | Resuelto: encabezados alineados a `Partial` con alcance pendiente |
| `specs/006` asume que el `ChatWidget` está pendiente | El widget existe y está montado en `frontend/src/app/layout.tsx` | Resuelto: supuesto actualizado; se aclara que no hay evidencia E2E del RAG ni de las tools |
| `specs/007` asume que la sincronización está en borrador | El cliente MCP, el servicio y el servidor MCP están implementados | Resuelto: supuesto actualizado; se aclara que no hay evidencia E2E de eventos ni de reconexión |
| `README.md` menciona el estado "en curso" | La lista `ESTADOS` de `barberos/turnos.service` no incluye `en_curso` | Resuelto: el README lista los cinco estados reales |
| `README.md` menciona un template RAG en Python | El agente observable está en JavaScript | Resuelto: se quitó la referencia a Python en los prompts |
| `datos_barberia.md` dice que el bot no reserva ni cancela | Las tools `reservar_turno` y `cancelar_turno` sí lo hacen | Pendiente de decisión (ajustar documento o prompt) |
| `/api/disponibilidad` está montado pero vacío | `backend/src/routes/disponibilidad.routes.js` no define rutas | Documentado como deuda en `ESTADO.md` y `tasks.md` de 008; sin cambios de código |
| `specs/index.md` afirma que no se hará backfill | Esta tarea realiza el backfill documental de `tasks.md` | Resuelto: índice actualizado con enlaces y nota de backfill |

---

## 4. Orden propuesto de trabajo

Se trabajará en lotes pequeños, persistiendo cada archivo antes de continuar.

### Lote 1 — Base documental

1. Crear `docs/sdd/ESTADO_DOCUMENTACION_SDD.md`.
2. Fijar la convención de `tasks.md` (ver sección 5).

### Lote 2 — Núcleo del sistema

3. `000-arquitectura`
4. `001-registro-passkeys`
5. `002-catalogo-servicios`
6. `003-reserva-turnos`
7. `004-gestion-turnos-cliente`
8. `005-panel-barberos`

### Lote 3 — IA e integraciones

9. `006-chatbot-langchain`
10. `007-sync-calendario-mcp`

### Lote 4 — Features parciales

11. `008-gestion-disponibilidad`
12. `009-historial-visitas`
13. `010-notificaciones-estado`

### Lote 5 — Analítica y clientes

14. `011-metricas-dashboard`
15. `012-vista-clientes`

### Lote 6 — Normalización final

16. Actualizar `specs/index.md` para enlazar los `tasks.md` y corregir la nota de backfill.
17. Actualizar `ESTADO.md` en la deuda de `tasks.md`.
18. Actualizar `README.md` solo en las afirmaciones contradichas por la evidencia.
19. Actualizar este documento con el estado final.

---

## 5. Convención para los `tasks.md`

Cada `tasks.md` seguirá esta estructura:

```markdown
# Tasks — NNN-nombre

> Feature: ...
> Fuentes: `spec.md`, `plan.md`, código y `ESTADO.md`.
> Convención: `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.
> Nota: documentación reconstruida después del desarrollo; no implica que Spec Kit se haya usado desde el inicio.

## Fase 1 — Preparación y configuración
## Fase 2 — Implementación
## Fase 3 — Integración
## Fase 4 — Pruebas
## Fase 5 — Documentación

## Dependencias
## Criterios de finalización
```

Reglas:

- IDs `T001`, `T002`, … únicos dentro de cada feature.
- Cada tarea indica archivo, componente o endpoint cuando exista evidencia.
- `[x]` solo si hay código o documento que lo respalde.
- `[ ]` para pruebas no ejecutadas, funcionalidad no implementada o verificación pendiente.
- No se marca una prueba como completada por la sola existencia de un archivo de test.
- Las tareas de prueba indican el comando o el escenario, pero no se ejecutan en esta tarea documental.
- Las dependencias se expresan con el ID de la tarea predecesora.
- Los criterios de finalización son verificables y no usan expresiones vagas.

---

## 6. Criterios de aceptación para dar por completada la documentación

1. Las 13 features preexistentes (000-012) y la mejora 013 tienen `tasks.md`.
2. Cada `tasks.md` referencia su `spec.md` y su `plan.md`.
3. Cada requisito funcional (`FR-###`) y criterio de éxito (`SC-###`) relevante tiene al menos una tarea asociada.
4. Cada tarea de implementación completada cita un archivo, ruta o componente verificable.
5. Las tareas de prueba pendientes están marcadas `[ ]` y no se presentan como aprobadas.
6. Las diferencias entre spec, plan e implementación quedan registradas como deuda o tarea pendiente.
7. El backfill no modificó código de producción, configuración, dependencias ni datos; la mejora 013 modificó únicamente `frontend/src/components/layout/Footer.tsx`.
8. `specs/index.md` enlaza los `tasks.md` y ya no afirma que el backfill no se realizará.
9. `ESTADO.md` refleja que los `tasks.md` fueron reconstruidos y distingue backfill documental de uso histórico de Spec Kit.
10. `README.md` no afirma que todos los CU están funcionales si `ESTADO.md` mantiene features parciales.
11. Este documento queda actualizado con el resultado final y la fecha.
12. No se crean commits ni se hace push.

---

## 7. Estado de avance

| Etapa | Estado |
|---|---|
| Inventario documental | Completado |
| Convención de `tasks.md` | Definida |
| `tasks.md` de 000-005 | Completado |
| `tasks.md` de 006-007 | Completado |
| `tasks.md` de 008-010 | Completado |
| `tasks.md` de 011-012 | Completado |
| Normalización de índice, ESTADO y README | Completado (2026-10-26) |
| Encabezados `Status` de 008/009/010 | Alineados a `Partial` |
| Supuestos editoriales de 006 y 007 | Corregidos (2026-10-26) |
| Ciclo SDD 013: `spec.md`, `plan.md`, `tasks.md` | Completado (2026-10-26) |
| Implementación de 013 | Completada (2026-10-26) |
| Validación de 013 | Completada con limitación de build en el repo (2026-10-26) |
| Registro de mejoras 013 | Completado (2026-10-26) |
| Incremento SDD 014 y relación con FR-008 de 006 | Implementación y evidencia automatizada registradas; verificación manual pendiente (2026-10-26) |

### Pendientes fuera de este backfill

- Evidencia E2E de los casos de uso (`smoke-results.json` no existe; `smoke.js` no se ejecutó).
- Verificación manual de la interacción de reinicio de 014 en navegador real.
- Decisión sobre `datos_barberia.md` vs. las tools del chatbot.
- Documento de definición del TP y transcripciones de prompts.
- Ejecutar el build de producción del frontend dentro del repositorio con `next dev` detenido; la mejora 013 se validó en una copia aislada y el intento en el repositorio no completó mientras ambos procesos usaban `.next`.

---

**Fin del inventario.** Los 13 `tasks.md` del backfill están creados y la documentación de estado quedó normalizada. Los supuestos editoriales de 006 y 007 se corrigieron el 2026-10-26 para distinguir código presente de evidencia de ejecución. `013-footer-anio` y el incremento `014-chat-reinicio-conversacion` tienen sus ciclos documentados; 014 amplía FR-008 sin duplicarlo. Quedan pendientes la interacción manual de 014, la verificación E2E de los casos de uso y ejecutar el build dentro del repositorio con el servidor de desarrollo detenido.
