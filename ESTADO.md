# Auditoría de Implementación — Sistema Barbería

**Fecha de actualización:** 10 de octubre de 2026

_Nota: Esta auditoría refleja el estado real del código (Next.js en frontend y Node.js/Express en backend) y de los modelos de Prisma/PostgreSQL, sin modificaciones de archivos._

## Tabla de estado por CU

| CU                                 |    Estado    | Justificación (1 línea)                                                                                                                          |
| :--------------------------------- | :----------: | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **CU-01 Autenticación (passkeys)** | ✅ Funcional | `routes/auth.routes.js` (registro/login opciones+verificar, sesión, logout) + `pages/login` y `pages/registro` con WebAuthn y `useSesion`.       |
| **CU-02 Catálogo servicios**       | ✅ Funcional | `servicios.controller.js` CRUD + borrado lógico (DELETE→activo) y `pages/servicios` con `ServicioCard/ServicioFormModal` (alta admin).           |
| **CU-03 Reservas**                 | ✅ Funcional | `POST /api/turnos` con validación de solapamiento (`turnos.service.js`) + `GET /api/barberos/:id/disponibilidad` y wizard `/reservar` completo.  |
| **CU-04 Mis Turnos**               | ✅ Funcional | `PATCH /api/turnos/:id/cancelar` y `/reprogramar` + `pages/mis-turnos` (próximos/historial, `CancelarTurnoDialog`, `ReprogramarDialog`).         |
| **CU-05 Panel Barberos**           |  ⚠️ Parcial  | Backend listo: `barberos.controller.js` expone agenda/estado/disponibilidad/métricas, pero **no existe ninguna página de panel en el frontend.** |
| **CU-06 Chatbot IA**               |  ⚠️ Parcial  | Fase 1 completada: Backend RAG `POST /api/chat` + `ChatWidget.tsx` ya montado en `layout.tsx`. Faltan tools de reserva ni auth (Fase 2).         |
| **CU-07 Google Calendar**          | ❌ Pendiente | `integraciones.routes.js` es un Router vacío; solo existe el campo `googleEventId` en el schema (se escribe null).                               |
| **CU-08 Ausencias**                |  ⚠️ Parcial  | `GET/PUT /api/barberos/me/disponibilidad` cubre horarios/días, pero no hay modelo `Bloqueo`/excepciones y `/api/disponibilidad` es stub vacío.   |
| **CU-09 Fichas de Cliente**        | ❌ Pendiente | `clientes.routes.js` es un Router vacío; no hay controller, modelo ni página de historial/ficha de cliente.                                      |
| **CU-10 Notificaciones**           | ❌ Pendiente | `notificaciones.routes.js` es un Router vacío; sin modelo, servicio ni componente de notificaciones.                                             |

## Hallazgos transversales

- **Endpoints Vacíos (Stubs):** `/api/clientes`, `/api/disponibilidad`, `/api/notificaciones`, `/api/integraciones` están montados pero vacíos. Responden 404 pese a estar ruteados en `routes/index.js`.
- **Modelo de datos:** Solo existen `Usuario`, `Barbero`, `Servicio`, `Turno`, `CredencialPasskey`. Faltan tablas para CU-07/08/09/10.
- **CU-03 vs CU-07:** La spec de CU-03 aceptó la excepción MVP (turno solo en PostgreSQL, `googleEventId=null`); la sync con Calendar queda como CU-07 pendiente.
- **CU-05:** El endpoint de cambio de estado ya existe (`PATCH /api/turnos/:id/estado`), listo para consumir cuando se construya el panel de barberos.
- **Riesgo CU-06:** `ChatWidget.tsx` usa un `fetch` directo a `http://127.0.0.1:3000/api/chat` (URL hardcodeada, sin `credentials: "include"` ni `NEXT_PUBLIC_API_URL`), a diferencia del resto que usa `apiFetch`.
- **Tests:** 0 archivos de test en el repo → deuda transversal que afecta el DoD (Definition of Done) de todos los CU.

**Resumen:** 4 completos (CU-01→04), 3 parciales (CU-05, CU-06, CU-08) y 3 pendientes (CU-07, CU-09, CU-10).
