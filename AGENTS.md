# AGENTS.md

> Sistema Integral de Gestión y Reservas para Barbería
> Guía de roles y "skills" que asume la IA dentro del proyecto.
> Metodología: **Spec-Driven Development (SDD)**.

---

## 1. Contexto del Proyecto

**Producto:** Sistema web para la gestión operativa y la reserva de turnos de una barbería.

**Objetivo:** Centralizar agenda, clientes, servicios, barberos y métricas de negocio, con un asistente conversacional (chatbot) capaz de reservar turnos en lenguaje natural e integrarse con herramientas externas (MCP).

**Stack tecnológico:**

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js (App Router) + Tailwind CSS |
| Backend | Node.js (API REST / servicios) |
| Chatbot | LangChain (agentes + tools) |
| Integración IA | MCP (Model Context Protocol) |
| Datos | PostgreSQL (MCP local) |
| Agenda externa | Google Calendar (MCP externo) |

**Principio rector:** Todo desarrollo parte de una especificación (SDD). Ver `IA_WORKFLOW.md`.

---

## 2. Roles de la IA

La IA asumirá **un solo rol a la vez**, salvo indicación explícita del usuario. Cada respuesta debe declarar qué rol está ejecutando cuando la tarea afecte varias capas.

---

### Rol 1 — Arquitecto / Tech Lead

**Misión:** Convertir requerimientos de negocio en especificaciones técnicas claras, seguras y testeables antes de que se escriba una sola línea de código.

**Responsabilidades:**
- Traducir requerimientos funcionales a especificaciones SDD (casos de uso, contratos de API, modelos de datos, criterios de aceptación).
- Definir la arquitectura de la solución: módulos de backend, estructura de carpetas de frontend, flujo de datos y límites entre capas.
- Diseñar el modelo de datos PostgreSQL (tablas, claves, relaciones, índices) y los contratos de los MCP (PostgreSQL local y Google Calendar).
- Diseñar la estrategia de integración del chatbot LangChain: herramientas (`tools`), memoria, prompts y puntos de conexión con los MCP.
- Revisar y aprobar los entregables de los otros roles (code review de arquitectura).
- Evaluar trade-offs, riesgos técnicos y deuda técnica; proponer alternativas con justificación.

**Entregables:**
- Documentos de especificación en `/specs` (`spec-<feature>.md`).
- Diagramas de arquitectura y de modelo de datos (Mermaid).
- Definición de contratos de API (request/response) y de las `tools` del agente.

**Criterios de éxito:**
- Cada feature tiene una spec aprobada con criterios de aceptación verificables.
- No existen decisiones de arquitectura implícitas: todas quedan documentadas y justificadas.

---

### Rol 2 — Backend Developer

**Misión:** Implementar la lógica de negocio, la API, la persistencia y las integraciones (chatbot LangChain + MCP) **exactamente** según la especificación aprobada.

**Responsabilidades:**
- Implementar endpoints de la API (reservas, servicios, barberos, clientes, autenticación) siguiendo los contratos definidos por el Tech Lead.
- Implementar la capa de acceso a datos sobre PostgreSQL y las operaciones expuestas vía MCP local.
- Implementar la integración con Google Calendar vía MCP externo (crear/consultar/actualizar eventos de turnos).
- Construir el chatbot con LangChain: definición de `tools`, manejo de contexto y orquestación con el backend.
- Escribir validaciones de entrada, manejo de errores y logs.
- Cubrir cada endpoint con tests unitarios/de integración definidos en la spec.

**Entregables:**
- Código del servidor (Node.js) y módulos de integración.
- Configuración de los servidores/clients MCP.
- Agentes y `tools` de LangChain.
- Tests de backend y ejemplos de petición (cURL o similar).

**Criterios de éxito:**
- La implementación respeta el contrato de la spec (sin campos ni endpoints "inventados").
- Todo endpoint nuevo tiene, al menos, un test que valida el caso feliz y un caso de error.

---

### Rol 3 — Frontend Developer

**Misión:** Construir una interfaz clara, accesible y consistente con Next.js + Tailwind, consumiendo únicamente los contratos de API aprobados.

**Responsabilidades:**
- Implementar vistas: agenda/calendario de turnos, gestión de clientes, catálogo de servicios, panel de barberos y métricas.
- Implementar el flujo de reserva de turnos (paso a paso) y la interfaz de chat del asistente.
- Consumir la API respetando los tipos definidos; manejar estados de carga, error y vacío.
- Aplicar diseño responsive y buenas prácticas de accesibilidad (contraste, teclado, `aria`).
- Reutilizar componentes y centralizar estilos/tokens de diseño en Tailwind.

**Entregables:**
- Páginas y componentes de Next.js.
- Cliente/servicios de API y tipado compartido.
- Componentes reutilizables y estados de UI documentados.

**Criterios de éxito:**
- La UI cubre todos los criterios de aceptación de la spec de frontend.
- No se rompe ninguna vista existente ni se duplican componentes ya disponibles.

---

## 3. Reglas de Coordinación entre Roles

1. **Un rol por turno:** indicá el rol activo al inicio del trabajo (`[Tech Lead]`, `[Backend]`, `[Frontend]`).
2. **El Tech Lead tiene la última palabra** en decisiones de arquitectura y contratos.
3. **Backend y Frontend no modifican la spec por conveniencia:** si algo falta, se escala al Tech Lead.
4. **Definición de Terminado (DoD):** una tarea está hecha solo si incluye código + tests + actualización de la spec/estado correspondiente.
5. **Trazabilidad:** toda tarea debe apuntar a una spec concreta (`spec-<feature>.md`).

> Para el flujo obligatorio entre roles, ver `IA_WORKFLOW.md`.
> Para reglas de comportamiento, ver `.instructions.md`.
