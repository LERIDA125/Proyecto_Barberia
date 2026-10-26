# Feature Specification: Reinicio de conversación del asistente

**Feature Branch**: `014-chat-reinicio-conversacion`

**Created**: 2026-10-26

**Status**: Planned

**Input**: Requisito FR-008 de `specs/006-chatbot-langchain/spec.md`: preservar el historial durante la sesión y permitir reiniciarlo. El backend ya expone `DELETE /api/asistente/historial`; la interfaz no ofrece la acción.

## User Scenarios & Testing

### User Story 1 - Reiniciar la conversación (Priority: P1)

Un cliente autenticado que está conversando con el asistente quiere empezar de cero sin cerrar sesión.

**Why this priority**: Es el requisito funcional pendiente de FR-008 y completa el control del historial que ya existe en el backend.

**Independent Test**: Con una conversación con mensajes, ejecutar la acción de reinicio, confirmar, y verificar que el widget vuelve al mensaje de bienvenida y que el backend ya no devuelve el historial anterior.

**Acceptance Scenarios**:

1. **Given** una conversación con mensajes y una sesión autenticada, **When** el cliente elige reiniciar y confirma, **Then** el widget muestra solo la bienvenida y elimina el identificador de conversación guardado.
2. **Given** una conversación persistida en el backend, **When** el reinicio se completa, **Then** `GET /api/asistente/historial` con el identificador anterior devuelve una lista vacía.
3. **Given** una conversación de otro usuario, **When** se intenta leer o borrar con su identificador, **Then** el backend responde `403` y no elimina el archivo.
4. **Given** un fallo de red o del backend durante el reinicio, **When** la operación falla, **Then** el widget conserva los mensajes actuales y muestra un mensaje de error controlado.
5. **Given** una sesión expirada, **When** el cliente intenta reiniciar, **Then** el widget informa que debe iniciar sesión nuevamente y no presenta el reinicio como exitoso.

## Edge Cases

- El cliente cancela la confirmación: no se envía ninguna petición y el historial no cambia.
- El almacenamiento local no está disponible: el reinicio del backend y del estado en memoria debe continuar.
- El cliente hace doble clic: la acción se ejecuta una sola vez mientras está en curso.
- No hay conversación activa: la acción no debe fallar; solo restablece el estado local.
- El endpoint responde `401`: se muestra el mensaje de sesión expirada, sin afirmar que el historial fue borrado.

## Requirements

### Functional Requirements

- **FR-014-001**: El widget MUST ofrecer una acción visible para reiniciar la conversación cuando hay una sesión autenticada.
- **FR-014-002**: La acción MUST pedir confirmación explícita antes de borrar el historial.
- **FR-014-003**: Si existe una conversación activa, el sistema MUST invocar `DELETE /api/asistente/historial` con el `sesionId` correspondiente antes de limpiar la vista.
- **FR-014-004**: Al completar el reinicio, el widget MUST mostrar únicamente la bienvenida, reiniciar el contador local de mensajes y eliminar el `sesionId` de `localStorage`.
- **FR-014-005**: Si el borrado falla, el widget MUST conservar los mensajes y mostrar un mensaje de error controlado; MUST NOT afirmar que el reinicio se completó.
- **FR-014-006**: La acción MUST evitar ejecuciones concurrentes y MUST ser accesible por teclado con nombre accesible.
- **FR-014-007**: El backend MUST seguir rechazando con `403` el acceso o borrado de conversaciones de otro usuario.
- **FR-014-008**: El cambio MUST NOT modificar contratos de API, dependencias, modelos de datos ni servicios de turnos.

### Key Entities

- **Conversación**: historial identificado por `conversation_id` y asociado a `usuarioId`.
- **Widget**: componente cliente que muestra el historial y permite iniciar el reinicio.
- **Sesión**: identidad autenticada que autoriza el borrado.

## Success Criteria

- **SC-014-001**: El 100% de los reinicios confirmados de una conversación existente deja el backend sin historial para ese identificador.
- **SC-014-002**: El 100% de los intentos de borrar una conversación ajena devuelve `403` y conserva el archivo.
- **SC-014-003**: Ante un fallo del endpoint, el 100% de los intentos conserva los mensajes visibles y muestra un error controlado.
- **SC-014-004**: Lint y TypeScript del frontend terminan sin errores nuevos.
- **SC-014-005**: La suite backend existente y los tests nuevos terminan en verde.

## Constraints

- Sin dependencias nuevas.
- Sin escrituras en datos reales ni en Google Calendar.
- Sin cambios en el contrato de `DELETE /api/asistente/historial`.
- La verificación de UI se limita a lint, TypeScript y una revisión manual; el proyecto no tiene runner de tests de componentes.

## Assumptions

- El endpoint `DELETE /api/asistente/historial` ya existe y está protegido por `requiereAuth`.
- El almacenamiento de conversaciones es local al backend y usa archivos JSON.
- El reinicio no elimina turnos ni notificaciones; solo el historial de chat.
