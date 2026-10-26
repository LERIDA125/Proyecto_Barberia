# Índice de Especificaciones — Sistema Integral de Barbería

> **Metodología:** GitHub Spec Kit.
> Este archivo es el índice de la estructura Spec Kit del proyecto: cada feature vive en `specs/NNN-nombre/` con su `spec.md` (el "qué") y su `plan.md` (el "cómo").
> **Constitución del proyecto:** [`../.specify/memory/constitution.md`](../.specify/memory/constitution.md) — principios, restricciones técnicas, roles y governance.

---

## 1. Arquitectura maestra

| Spec Kit | Título | Estado |
|:---------|:-------|:------:|
| [`000-arquitectura`](./000-arquitectura/spec.md) | Arquitectura del Sistema de Barbería | ✅ Implemented |

`spec.md` describe la arquitectura technology-agnostic (qué es, actores, capacidades); `plan.md` contiene el diseño técnico completo: capas, modelo de datos, árbol de carpetas y decisiones con trade-offs.

---

## 2. Features (numeración Spec Kit)

| Spec Kit | Título | Estado |
|:---------|:-------|:------:|
| [`001-registro-passkeys`](./001-registro-passkeys/spec.md) | Registro y Autenticación con Passkeys | ✅ Implemented |
| [`002-catalogo-servicios`](./002-catalogo-servicios/spec.md) | Catálogo de Servicios | ✅ Implemented |
| [`003-reserva-turnos`](./003-reserva-turnos/spec.md) | Reserva de Turnos | ✅ Implemented |
| [`004-gestion-turnos-cliente`](./004-gestion-turnos-cliente/spec.md) | Gestión de Turnos del Cliente | ✅ Implemented |
| [`005-panel-barberos`](./005-panel-barberos/spec.md) | Panel de Barberos | ✅ Implemented |
| [`006-chatbot-langchain`](./006-chatbot-langchain/spec.md) | Asistente Conversacional (LangChain + RAG) | ⚠️ Partial |
| [`007-sync-calendario-mcp`](./007-sync-calendario-mcp/spec.md) | Sincronización con Google Calendar (MCP) | ⚠️ Partial |
| [`008-gestion-disponibilidad`](./008-gestion-disponibilidad/spec.md) | Gestión de Disponibilidad y Ausencias | ⚠️ Partial |
| [`009-historial-visitas`](./009-historial-visitas/spec.md) | Historial de Visitas (Fichas de Cliente) | ⚠️ Partial |
| [`010-notificaciones-estado`](./010-notificaciones-estado/spec.md) | Notificaciones de Estado de Turno | ⚠️ Partial |
| [`011-metricas-dashboard`](./011-metricas-dashboard/spec.md) | Dashboard de Métricas de Negocio | ✅ Implemented |
| [`012-vista-clientes`](./012-vista-clientes/spec.md) | Vista de Clientes | ✅ Implemented |
| [`013-footer-anio`](./013-footer-anio/spec.md) | Año del pie de página sin actualización diferida | Implemented |
| [`014-chat-reinicio-conversacion`](./014-chat-reinicio-conversacion/spec.md) | Reinicio de conversación del asistente (incremento de FR-008) | ⚠️ Partial |

> El estado detallado por feature, con justificación y evidencia de código, se audita en [`../ESTADO.md`](../ESTADO.md).
>
> **013-footer-anio** es la primera feature creada e implementada con el ciclo completo specify → plan → tasks → implement después del backfill documental. Su build se validó en una copia aislada; el intento en el repositorio no completó mientras el servidor de desarrollo usaba el mismo `.next`.
>
> **014-chat-reinicio-conversacion** amplía y completa en la UI el requisito FR-008 de 006 mediante el endpoint de historial existente. La implementación, los tests de propiedad/borrado, lint y TypeScript tienen evidencia; el estado es **Partial** porque no se verificó manualmente en un navegador real. `006-chatbot-langchain` también permanece **Partial** por sus pruebas del agente y verificaciones end-to-end pendientes.
>
> **Nota sobre 008/009/010:** sus `plan.md` declaran endpoints que aún no existen (`/api/barberos/me/horarios`, `/api/admin/feriados`, `/api/clientes/:id/ficha`, `/api/notificaciones/preferencias`, recordatorios por email). Lo que sí está implementado y operativo es el subconjunto de esas features listado en `ESTADO.md`; por eso su estado es **Partial** y no Implemented.
>
> **Backfill documental (2026-10-26):** las 13 features preexistentes (000-012) cuentan con `tasks.md` reconstruido a partir de `spec.md`, `plan.md`, el código y `ESTADO.md`. El backfill documenta el estado real; **no demuestra** que Spec Kit se haya usado desde el inicio: los primeros commits de código precedieron a los specs. El pipeline completo specify → plan → **tasks** → implement se aplicó en 013 y es obligatorio en adelante.
>
> **Tracking de tareas:** [000](./000-arquitectura/tasks.md) · [001](./001-registro-passkeys/tasks.md) · [002](./002-catalogo-servicios/tasks.md) · [003](./003-reserva-turnos/tasks.md) · [004](./004-gestion-turnos-cliente/tasks.md) · [005](./005-panel-barberos/tasks.md) · [006](./006-chatbot-langchain/tasks.md) · [007](./007-sync-calendario-mcp/tasks.md) · [008](./008-gestion-disponibilidad/tasks.md) · [009](./009-historial-visitas/tasks.md) · [010](./010-notificaciones-estado/tasks.md) · [011](./011-metricas-dashboard/tasks.md) · [012](./012-vista-clientes/tasks.md) · [013](./013-footer-anio/tasks.md) · [014](./014-chat-reinicio-conversacion/tasks.md)

---

## 3. Estructura de cada feature

```text
specs/NNN-nombre/
├── spec.md     # El QUÉ: historias de usuario, requisitos funcionales (FR-###),
│               #       entidades clave, criterios de éxito (SC-###) y supuestos
├── plan.md     # El CÓMO: resumen, contexto técnico, endpoints REST, componentes
│               #       de UI, constitution check, estructura del proyecto y riesgos
└── tasks.md    # Tareas atómicas, dependencias y criterios de finalización
                #       (backfill documental; [x] solo con evidencia)
```

- **spec.md** es technology-agnostic: describe capacidades y criterios verificables sin detalle de implementación.
- **plan.md** concentra el detalle técnico: endpoints, rutas, componentes, dependencias y decisiones.

---

## 4. Trazabilidad

| Artefacto | Ubicación | Rol |
|-----------|-----------|-----|
| Constitución | `.specify/memory/constitution.md` | Principios, restricciones técnicas, roles y governance |
| Arquitectura maestra | `specs/000-arquitectura/` | Capas, entidades y decisiones técnicas |
| Especificaciones | `specs/NNN-nombre/spec.md` | Qué, para qué y criterios de aceptación por feature |
| Planes de implementación | `specs/NNN-nombre/plan.md` | Cómo: contratos, componentes y estructura por feature |
| Tracking de ejecución | `specs/NNN-nombre/tasks.md` | Tareas atómicas por feature; backfill 2026-10-26 para 000-012 y ciclo completo para 013 |
| Registro de mejoras | [`../docs/sdd/REGISTRO_MEJORAS_SDD.md`](../docs/sdd/REGISTRO_MEJORAS_SDD.md) | Especificación, cambios, pruebas y limitaciones del ciclo 013 |
| Mejora 013 | [`013-footer-anio/`](./013-footer-anio/) + `frontend/src/components/layout/Footer.tsx` | Trazabilidad directa spec → plan → tasks → código → verificación |
| Incremento 014 | [`014-chat-reinicio-conversacion/`](./014-chat-reinicio-conversacion/) + [`ChatWidget.tsx`](../frontend/src/components/chat/ChatWidget.tsx) + tests de historial | Completa la acción de reinicio de FR-008 de 006; sin cambios de contrato |
| Auditoría de estado | [`../ESTADO.md`](../ESTADO.md) | Estado real del código por feature, fechado |
| Contexto para agentes | [`../.opencode/agents/`](../.opencode/agents/) | Roles: Tech Lead, Backend, Frontend |
| Fuente del RAG | [`../datos_barberia.md`](../datos_barberia.md) | Documento fuente del chatbot (NO es una spec) |

---

## 5. Herramientas MCP documentadas

| MCP | Features relacionadas | Descripción |
|-----|:---------------------:|-------------|
| PostgreSQL (local, stdio) | 006, 009 | Inspección de esquema en solo lectura para agentes |
| Google Calendar (externo, HTTP) | 007 | Sincronización de turnos con la agenda externa |

> La configuración operativa de ambos servidores MCP vive en [`../opencode.json`](../opencode.json) (integración con OpenCode) y en [`../backend/src/mcp/`](../backend/src/mcp/) (implementación).
