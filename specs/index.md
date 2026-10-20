# Índice de Especificaciones — Sistema Integral de Barbería

> **Metodología:** Spec-Driven Development (SDD)
> **Mapa maestro de specs:** este archivo indexa todos los documentos de especificación del proyecto.
> **Flujo obligatorio:** [`../IA_WORKFLOW.md`](../IA_WORKFLOW.md) · **Reglas de oro:** [`../.instructions.md`](../.instructions.md)

---

## 1. Documento de arquitectura

| Documento | Rol |
|-----------|-----|
| [`SDD.md`](./SDD.md) | **System Design Document** — spec maestra: capas, modelo de datos completo, árbol de carpetas y decisiones de arquitectura con trade-offs. Es la fuente de verdad para entidades y contratos transversales. |

---

## 2. Casos de uso (CU-01 → CU-10)

Los 10 casos de uso del sistema. Cada spec define contrato de API, modelo de datos afectado y criterios de aceptación verificables.

| CU | Spec | Título | Estado |
|:---|:-----|:-------|:------:|
| **CU-01** | [`spec-cu01-registro-passkeys.md`](./spec-cu01-registro-passkeys.md) | Autenticación con Passkeys (WebAuthn) | ✅ Funcional |
| **CU-02** | [`spec-cu02-catalogo-servicios.md`](./spec-cu02-catalogo-servicios.md) | Catálogo de Servicios | ✅ Funcional |
| **CU-03** | [`spec-cu03-reserva-turnos.md`](./spec-cu03-reserva-turnos.md) | Reserva de Turnos | ✅ Funcional |
| **CU-04** | [`spec-cu04-gestion-turnos-cliente.md`](./spec-cu04-gestion-turnos-cliente.md) | Gestión de Turnos (Cliente) | ✅ Funcional |
| **CU-05** | [`spec-cu05-panel-barberos.md`](./spec-cu05-panel-barberos.md) | Panel de Barberos | ✅ Funcional |
| **CU-06** | [`spec-cu06-chatbot-langchain.md`](./spec-cu06-chatbot-langchain.md) | Asistente Inteligente (LangChain + RAG) | ⚠️ Parcial |
| **CU-07** | [`spec-cu07-sync-calendario-mcp.md`](./spec-cu07-sync-calendario-mcp.md) | Sincronización de Calendario (MCP) | ⚠️ Parcial |
| **CU-08** | [`spec-cu08-gestion-disponibilidad.md`](./spec-cu08-gestion-disponibilidad.md) | Gestión de Disponibilidad (Bloqueos) | ✅ Funcional |
| **CU-09** | [`spec-cu09-historial-visitas.md`](./spec-cu09-historial-visitas.md) | Historial de Visitas (Fichas de Cliente) | ✅ Funcional |
| **CU-10** | [`spec-cu10-notificaciones-estado.md`](./spec-cu10-notificaciones-estado.md) | Notificaciones de Estado | ✅ Funcional |

> El estado detallado por CU, con justificación y evidencia de código, se audita en [`../ESTADO.md`](../ESTADO.md).

---

## 3. Features adicionales (specs ODD)

Features que surgieron por fuera de los 10 CU originales y siguen el mismo pipeline SDD.

| Feature | Spec | Estado |
|:--------|:-----|:------:|
| Vista de Clientes | [`spec-vista-clientes.md`](./spec-vista-clientes.md) | ✅ Funcional |
| Dashboard de Métricas | [`spec-metricas-dashboard.md`](./spec-metricas-dashboard.md) | ✅ Funcional |

> El seguimiento de ejecución de estas features vive en [`../odd/tasks/`](../odd/tasks/).

---

## 4. Trazabilidad SDD

El pipeline completo está definido en [`../IA_WORKFLOW.md`](../IA_WORKFLOW.md) con 4 gates obligatorios:

```
Requerimientos → Specs → Código → Testing
   (GATE 1)    (GATE 2)         (GATE 3/4)
```

**Regla fundamental:** ninguna línea de código se escribe sin una especificación aprobada. Si un gate falla, se detiene la codificación, se corrige la spec y recién entonces se reimplementa.

| Artefacto | Ubicación | Rol |
|-----------|-----------|-----|
| Especificaciones | `specs/spec-*.md` | Contrato de API, modelo de datos y criterios de aceptación por feature |
| Arquitectura maestra | [`specs/SDD.md`](./SDD.md) | Capas, entidades y decisiones técnicas |
| Tracking de ejecución | `odd/tasks/*.md` | Superficies autorizadas, verificaciones y evidencia por tarea |
| Auditoría de estado | [`../ESTADO.md`](../ESTADO.md) | Estado real del código por CU, fechado |
| Contexto para agentes | [`../.opencode/agents/`](../.opencode/agents/) | Roles: Tech Lead, Backend, Frontend |
| Fuente del RAG | [`../datos_barberia.md`](../datos_barberia.md) | Documento fuente del chatbot (NO es una spec) |

---

## 5. Herramientas MCP documentadas

| MCP | Spec relacionada | Descripción |
|-----|:----------------:|-------------|
| PostgreSQL (local, stdio) | CU-06, CU-09 | Inspección de esquema en solo lectura para agentes |
| Google Calendar (externo, HTTP) | CU-07 | Sincronización de turnos con la agenda externa |

> La configuración operativa de ambos servidores MCP vive en [`../opencode.json`](../opencode.json) (integración con OpenCode) y en [`../backend/src/mcp/`](../backend/src/mcp/) (implementación).
