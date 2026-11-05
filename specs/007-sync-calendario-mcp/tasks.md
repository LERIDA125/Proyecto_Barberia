# Tasks — 007-sync-calendario-mcp

> **Feature:** Sincronización con Google Calendar (MCP) (CU-07)
> **Fuentes:** `spec.md`, `plan.md`, `backend/src/services/integraciones.service.js`, `backend/src/controllers/integraciones.controller.js`, `backend/src/routes/integraciones.routes.js`, `backend/src/mcp/google-calendar/`, `backend/src/mcp/client.js`, `frontend/src/app/panel/configuracion/page.tsx`, `frontend/src/components/integraciones/`, `ESTADO.md`.
> **Convención:** `[x]` = respaldado por evidencia; `[ ]` = pendiente o no verificado.
> **Nota:** backfill documental posterior al desarrollo. La spec dice “en borrador”, pero el cliente, el servidor MCP, los endpoints y parte de la UI existen. La verificación real contra Google Calendar sigue sin evidencia de escritura.

## Fase 1 — Preparación y configuración

- [x] **T001** Definir las variables OAuth y de calendario (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_REFRESH_TOKEN`, `CALENDAR_ID`, `TIMEZONE`) en `.env.example`.
- [x] **T002** Configurar `MCP_CALENDAR_URL`, `MCP_CALENDAR_ID` y el flag de integración en `backend/src/config/env.js`.
- [x] **T003** Definir los contratos de las tools MCP (`crearEvento`, `actualizarEvento`, `eliminarEvento`, `consultarEventos`, `verificarConexion`) en `plan.md`.
- [x] **T004** Definir los cuatro endpoints de integración y sus roles en `plan.md`.
- [x] **T005** Definir la estrategia de idempotencia mediante `Turno.googleEventId` (FR-011).
- [ ] **T006** Verificar que ninguna credencial OAuth se loguee ni se devuelva en respuestas (FR-007, SC-005).
- [ ] **T007** Confirmar que el servidor MCP usado sea el externo previsto. En el repo también existe una implementación local en `backend/src/mcp/google-calendar/`; documentar cuál se usa en cada entorno.

## Fase 2 — Implementación

- [x] **T008** Implementar el cliente MCP con transporte HTTP/SSE en `backend/src/mcp/client.js` y `backend/src/mcp/google-calendar/index.js`.
- [x] **T009** Implementar el servidor MCP de Google Calendar en `backend/src/mcp/google-calendar/` (OAuth 2.0 + Calendar API).
- [x] **T010** Implementar `verificarConexion` y el endpoint `GET /api/integraciones/calendar/estado` (FR-005).
- [x] **T011** Implementar `crearEvento` y guardar `googleEventId` en el turno (FR-001).
- [x] **T012** Implementar `actualizarEvento` al reprogramar sin duplicar el evento (FR-002).
- [x] **T013** Implementar `eliminarEvento` al cancelar y limpiar `googleEventId` (FR-003).
- [x] **T014** Implementar `consultarEventos` y `GET /api/integraciones/calendar/eventos` para barbero/admin (FR-009).
- [x] **T015** Implementar `POST /api/integraciones/calendar/sincronizar/:turnoId` para forzar la sincronización de un turno (FR-006).
- [x] **T016** Implementar `POST /api/integraciones/calendar/reconectar` (FR-005).
- [x] **T017** Implementar envoltorios resilientes que no lancen excepción en los flujos de turno y devuelvan `pendiente` (FR-004).
- [x] **T018** Integrar la sincronización en alta, reprogramación y cancelación desde `backend/src/services/turnos.service.js`.
- [x] **T019** Construir el título `Turno: <servicio> - <cliente>` y la descripción con barbero, servicio, cliente y notas (FR-010).
- [x] **T020** Implementar `CalendarStatusCard` en `frontend/src/components/integraciones/CalendarStatusCard.tsx`.
- [x] **T021** Implementar `SyncTurnoButton` en `frontend/src/components/integraciones/SyncTurnoButton.tsx`.
- [x] **T022** Implementar el panel en `frontend/src/app/panel/configuracion/page.tsx`.
- [ ] **T023** Implementar `IntegracionesPage` en `frontend/src/app/configuracion/integraciones/page.tsx`. No existe con esa ruta; la UI real vive en `/panel/configuracion`.
- [ ] **T024** Implementar `Toast` en `frontend/src/components/ui/Toast.tsx`. No existe; verificar cómo se informa éxito/error.
- [ ] **T025** Implementar el flujo OAuth interactivo completo para reconectar. El endpoint actual solo verifica conexión con el token existente.

## Fase 3 — Integración

- [x] **T026** Mostrar estado conectado/desconectado, calendario destino y última sincronización en la UI.
- [x] **T027** Permitir al admin forzar la sincronización desde la UI.
- [x] **T028** Consultar eventos del calendario desde el panel para barbero/admin.
- [ ] **T029** Verificar que un alta de turno cree un evento real y guarde `googleEventId` (SC-001).
- [ ] **T030** Verificar que reprogramar actualice el evento existente sin duplicarlo (SC-002).
- [ ] **T031** Verificar que cancelar elimine o marque el evento externo de forma consistente (SC-003).
- [ ] **T032** Verificar con el MCP caído que el turno se persiste y queda pendiente de sincronización (SC-004).
- [ ] **T033** Verificar la reconexión y el refresco de token sin exponer credenciales.
- [ ] **T034** Verificar el manejo de zona horaria y timestamps absolutos.

## Fase 4 — Pruebas

- [ ] **T035** Crear tests del cliente MCP con el servidor mockeado: conexión, alta, actualización, eliminación y consulta.
- [ ] **T036** Crear tests de `integraciones.service`: alta idempotente, reprogramación, cancelación y estado.
- [ ] **T037** Crear tests de resiliencia: MCP caído, timeout y error de Google; el turno no se pierde.
- [ ] **T038** Crear tests de los cuatro endpoints: caso feliz, `401`, `403`, `404` y `502`.
- [ ] **T039** Verificar con un test que no existan llamadas directas a Google fuera de `backend/src/mcp/` (SC-006).
- [ ] **T040** Agregar al menos un test de caso feliz y uno de error por endpoint (SC-007).

## Fase 5 — Documentación

- [x] **T041** Documentar `spec.md` y `plan.md`.
- [x] **T042** Registrar el estado `Partial` en `ESTADO.md`.
- [x] **T043** Crear este `tasks.md` como backfill.
- [ ] **T044** Corregir la contradicción “borrador” vs implementación real en `spec.md` y `plan.md`.
- [ ] **T045** Documentar la diferencia entre la implementación MCP local del repo y el servidor MCP externo descrito en la spec.
- [ ] **T046** Documentar la diferencia de URL/puerto del MCP y la ruta real de la UI de integraciones.

## Dependencias

- T008-T019 dependen de T001-T007.
- T020-T025 dependen de T010-T019.
- T026-T034 dependen de T020-T025.
- T035-T040 dependen de T026-T034.

## Criterios de finalización

1. Alta, reprogramación y cancelación se reflejan en Google Calendar.
2. El turno guarda `googleEventId` y la sincronización es idempotente.
3. Si el MCP falla, el turno se conserva y queda pendiente.
4. El admin ve el estado y puede forzar la sincronización.
5. Las credenciales solo viven en variables de entorno y no se loguean.
6. No hay llamadas directas a Google fuera del módulo MCP.
7. Cada endpoint tiene al menos un test de caso feliz y uno de error.
8. La sincronización real se marca verificada solo con evidencia de escritura.
