# Implementation Plan: Reinicio de conversación del asistente

**Branch**: `014-chat-reinicio-conversacion` | **Date**: 2026-10-26 | **Spec**: [spec.md](./spec.md)

## Summary

Agregar al `ChatWidget` una acción de reinicio que confirme la intención, invoque el endpoint existente `DELETE /api/asistente/historial`, limpie el estado local y elimine el identificador persistido. Cubrir con tests el borrado y la propiedad del historial en el backend, sin modificar el contrato ni los servicios de negocio.

## Componentes afectados

| Componente | Cambio |
|---|---|
| `frontend/src/components/chat/ChatWidget.tsx` | Acción de reinicio, estado de progreso, confirmación, manejo de error y limpieza local. |
| `backend/src/tests/asistente.historial.test.js` | Tests nuevos de lectura, borrado y rechazo de conversaciones ajenas. |
| `docs/sdd/PLAN_MEJORAS_FUNCIONALES.md` | Registro del incremento y actualización del estado. |
| `specs/014-chat-reinicio-conversacion/tasks.md` | Evidencia de tareas y pruebas. |

No se modifica `asistente.service.js`, `conversations.js`, el controlador ni las rutas: el contrato ya cubre la operación.

## Enfoque técnico

1. Agregar estado `reiniciando` para bloquear dobles ejecuciones.
2. Agregar un botón en el encabezado del widget, visible solo con sesión autenticada, con `aria-label` y estado `disabled` durante el envío o el reinicio.
3. Al activarlo, pedir confirmación con `window.confirm`. Si el cliente cancela, no hacer nada.
4. Si existe una sesión del usuario actual, ejecutar `DELETE /api/asistente/historial?sesionId=...`.
5. Si la petición falla, conservar los mensajes y agregar un mensaje de error controlado. Si es `401`, usar el mensaje de sesión expirada.
6. Si la petición se completa, eliminar la clave de `localStorage`, limpiar `sesion`, restaurar `[BIENVENIDA]` y reiniciar `siguienteId`.
7. Si no hay sesión activa, solo limpiar el estado local y la clave de almacenamiento.

## Dependencias

- Endpoint `DELETE /api/asistente/historial` y middleware `requiereAuth` existentes.
- `ApiError` y `apiFetch` existentes.
- `useSesion` existente.

## Decisiones de diseño

- **Sin nuevo contrato:** se reutiliza el endpoint y la respuesta `{ ok: true }`.
- **Confirmación en el cliente:** el borrado es irreversible para el historial; la confirmación evita pérdidas accidentales.
- **Fallo conservador:** ante un error no se limpia la UI, para no simular un borrado que no ocurrió.
- **Sin tests de UI:** el proyecto no tiene runner de componentes; se agregan tests de backend y se valida el frontend con lint/TypeScript más revisión manual.
- **Sin cambios de modelo:** no se toca PostgreSQL ni el almacenamiento de turnos.

## Riesgos

- **Sesión expirada:** el endpoint responde `401`; el widget debe informarlo sin limpiar el historial.
- **Almacenamiento local bloqueado:** `localStorage` puede lanzar; se maneja con `try/catch` y el reinicio en memoria continúa.
- **Doble clic:** se evita con `reiniciando` y `disabled`.
- **Pérdida accidental:** se mitiga con confirmación explícita.
- **Regresión:** el cambio se limita al widget; no altera el envío de mensajes ni el historial del backend.

## Estrategia de pruebas

### Backend

- Test de lectura del historial propio.
- Test de borrado del historial propio y verificación de que el archivo desaparece.
- Test de `403` al leer o borrar una conversación ajena.
- Test de historial inexistente o sin `sesionId` (lista vacía).
- Uso de `ASISTENTE_DATA_DIR` apuntando a un directorio temporal para no tocar datos reales.

### Frontend

- `npm run lint`.
- `npx tsc --noEmit`.
- Revisión manual del botón, confirmación y estados; sin test automatizado de componentes.

## Compatibilidad

- El contrato de `DELETE /api/asistente/historial` no cambia.
- El historial existente sigue siendo legible; solo se agrega la posibilidad de borrarlo desde la UI.
- No se modifican tools, RAG, turnos ni Calendar.

## Constitution Check

- **I. Spec antes que código:** PASS — spec y plan creados antes de implementar.
- **II. Gates secuenciales:** PASS — requisitos, spec y plan definidos; tasks a continuación.
- **III. Contratos primero:** PASS — se reutiliza el contrato existente, sin inventar campos.
- **IV. Testing obligatorio:** PASS — tests de backend; limitación de UI documentada.
- **V. Modularidad y capas:** PASS — el widget consume la API; no accede a datos ni duplica reglas.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
