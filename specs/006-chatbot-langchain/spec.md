# Feature Specification: Asistente Conversacional (LangChain + RAG)

**Feature Branch**: `006-chatbot-langchain`

**Created**: 2026-10-20

**Status**: Partial

**Input**: User description: "CU-06 — Asistente conversacional en lenguaje natural: consulta disponibilidad, crea turnos, consulta y cancela turnos del usuario y responde preguntas sobre servicios. El asistente no duplica la lógica de negocio: invoca tools que llaman a los mismos services del backend."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultas de información (RAG) (Priority: P1)

Un cliente pregunta por servicios, precios u horarios y el asistente responde con información del local, sin inventar datos.

**Why this priority**: Es la capacidad base del asistente y la primera fase implementada; entrega valor aun sin acciones de reserva.

**Independent Test**: Se puede probar enviando una pregunta sobre servicios y verificando que la respuesta se basa en la base de conocimiento del local y no en datos inventados.

**Acceptance Scenarios**:

1. **Given** una base de conocimiento cargada, **When** el cliente pregunta por servicios y precios, **Then** el asistente responde con información real del local.
2. **Given** el proveedor de lenguaje no disponible, **When** el cliente envía un mensaje, **Then** el chat muestra un mensaje de disculpa sin romper la UI.

---

### User Story 2 - Reserva por lenguaje natural (Priority: P2)

Un cliente consulta disponibilidad y crea un turno conversando con el asistente, tras una confirmación explícita, con la misma validación de negocio que la API.

**Why this priority**: Es el valor diferencial del asistente, pero depende de las tools y del flujo base de reserva (CU-03).

**Independent Test**: Se puede probar pidiendo disponibilidad y confirmando una reserva por chat, verificando que no hay solapamientos y que la reserva usa la identidad de la sesión.

**Acceptance Scenarios**:

1. **Given** un cliente autenticado, **When** pregunta por disponibilidad, **Then** el asistente responde con franjas reales obtenidas del backend.
2. **Given** una franja disponible y una confirmación explícita del cliente, **When** el asistente crea el turno, **Then** la reserva usa la misma validación que la API (sin solapamientos).
3. **Given** un error de negocio (franja ocupada), **When** el asistente lo detecta, **Then** lo comunica en lenguaje natural.

---

### User Story 3 - Gestión conversacional de turnos e historial (Priority: P3)

Un cliente lista, cancela sus turnos por chat y conserva/reinicia el historial de la conversación dentro de la sesión.

**Why this priority**: Completa la experiencia conversacional, pero puede entregarse después de consultas y creación.

**Independent Test**: Se puede probar listando y cancelando un turno propio por chat (con confirmación previa) y reiniciando la conversación.

**Acceptance Scenarios**:

1. **Given** un cliente con turnos, **When** pide ver sus turnos por chat, **Then** el asistente los lista usando la identidad de la sesión.
2. **Given** una solicitud de cancelación con confirmación previa, **When** el asistente la ejecuta, **Then** cancela únicamente un turno del usuario autenticado.
3. **Given** una conversación en curso, **When** el cliente la reinicia, **Then** el historial se limpia.

---

### Edge Cases

- ¿Qué pasa si el cliente incluye un identificador de otro usuario en el texto? → el asistente ignora ese dato y usa siempre la identidad de la sesión.
- ¿Qué pasa si la base de conocimiento no está cargada? → error controlado (sin base de conocimiento) y mensaje claro.
- ¿Qué pasa si el mensaje está vacío o el usuario no está autenticado? → rechazo explícito.
- ¿Qué pasa ante alucinaciones del modelo? → mitigar con prompt estricto y tools con salida estructurada.
- ¿Qué pasa ante costos/latencia del proveedor? → cachear catálogo y limitar el contexto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El asistente MUST responder preguntas sobre servicios, precios y horarios con información real del local (RAG sobre una base de conocimiento).
- **FR-002**: El asistente MUST consultar disponibilidad real del backend al responder sobre franjas.
- **FR-003**: El asistente MUST crear un turno tras confirmación explícita del cliente, usando la misma validación que la API.
- **FR-004**: El asistente MUST listar y cancelar los turnos del usuario autenticado, con confirmación previa antes de cancelar.
- **FR-005**: El asistente MUST usar la identidad de la sesión autenticada (`usuarioId`) y nunca un identificador provisto en el texto.
- **FR-006**: El asistente MUST comunicar los errores de negocio (franja ocupada, etc.) en lenguaje natural.
- **FR-007**: El asistente MUST responder en español y no inventar servicios ni disponibilidad.
- **FR-008**: El sistema MUST preservar el historial de conversación durante la sesión y permitir reiniciarlo.
- **FR-009**: El asistente MUST mostrar un mensaje de disculpa si el proveedor de lenguaje falla, sin romper la UI.
- **FR-010**: El sistema MUST exigir autenticación para las capacidades de reserva y gestión de turnos.
- **FR-011**: Las tools del asistente MUST reutilizar los services del backend, sin reimplementar validaciones.

### Key Entities

- **Conversación**: historial de mensajes entre el cliente y el asistente, acotado a una sesión.
- **Turno**: resultado de una acción de reserva/cancelación ejecutada por el asistente.
- **Usuario**: identidad de la sesión que autoriza y contextualiza las tools.
- **Base de conocimiento**: documento fuente con la información pública del local usada para responder consultas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El cliente obtiene franjas reales del backend en el 100% de las consultas de disponibilidad.
- **SC-002**: El 100% de los turnos creados por el asistente pasa la misma validación de negocio que la API (0 solapamientos).
- **SC-003**: El 100% de las acciones con escritura (crear/cancelar) ocurre tras confirmación explícita del cliente.
- **SC-004**: Las tools usan exclusivamente la identidad de la sesión; 0 casos de identidad tomada del texto del usuario.
- **SC-005**: Ante error de negocio, el asistente lo comunica en lenguaje natural en el 100% de los casos.
- **SC-006**: Ante fallo del proveedor de lenguaje, el chat muestra un mensaje de disculpa sin errores de render.
- **SC-007**: El historial se conserva durante la sesión y se puede reiniciar.
- **SC-008**: Cada endpoint tiene al menos un test del caso feliz y un caso de error (con el proveedor de lenguaje y las tools mockeadas).

## Assumptions

- Alcance: agente, tools, memoria y endpoints de chat.
- Fuera de alcance: voz, multiidioma, acciones administrativas por chat.
- Estado actual: backend de la fase 1 (RAG de consulta) y de la fase 2 (tools de reserva y tool loop) implementados; pendientes la UI del widget (credenciales y render de tools) y los tests de CA-06.9.
- El cliente está autenticado (ver 001-registro-passkeys) y existen los services de reservas/servicios/turnos (CU-02, CU-03, CU-04).
- Se dispone de un proveedor de lenguaje configurable (definido por el Tech Lead) y de la base de conocimiento del local.
