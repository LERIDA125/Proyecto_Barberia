# Informe Técnico de Defensa

**Proyecto:** Sistema integral de gestión y reservas para Barbería  
**Rol de análisis:** Arquitecto / Tech Lead  
**Fecha del relevamiento:** 26 de octubre de 2026  
**Alcance:** código y documentación presentes en el workspace. Las rutas de este informe son relativas a la raíz del repositorio.

> **Idea central para la defensa:** el producto tiene una separación práctica entre UI, API/servicios, persistencia e integraciones, pero no implementa DDD táctico completo con módulos `domain`, `application` e `infrastructure`. La lógica de negocio reside principalmente en servicios Node.js que usan Prisma. Conviene presentar esto como una evolución arquitectónica hacia una separación más clara, no afirmar que ya existen entidades de dominio puras o repositorios abstractos.

## Resumen ejecutivo del estado real

- **Stack operativo:** Next.js App Router + TypeScript en `frontend/`; API REST en Express/Node.js en `backend/`; Prisma como acceso de la aplicación a PostgreSQL; LangChain.js para el asistente; MCP independiente de PostgreSQL y de Google Calendar.
- **Flujos principales implementados:** passkeys, catálogo, reserva, disponibilidad calculada a partir de jornada/turnos/bloqueos, gestión de turnos, agenda de personal, métricas, clientes e historial, notificaciones dentro de la aplicación.
- **Integraciones parciales:** el chatbot puede consultar disponibilidad, crear/cancelar turnos y consultar turnos propios con tools; Google Calendar se invoca al crear, reprogramar y cancelar, pero la sincronización real requiere el MCP/credenciales externos y su validación end-to-end no está acreditada.
- **Límite importante de arquitectura:** la aplicación web consulta PostgreSQL mediante Prisma, no por el servidor MCP local. El MCP PostgreSQL declarado en `opencode.json` es una herramienta de inspección del esquema en solo lectura para agentes/desarrollo.
- **DDD:** no aparecen carpetas ni clases explícitas de entidades, value objects, agregados o interfaces de repositorio. Las reglas están en `backend/src/services/` y el esquema persistente en `backend/prisma/schema.prisma`.
- **Trazabilidad SDD:** hay specs 000–014 en `specs/`. `specs/index.md` y `ESTADO.md` advierten que los primeros commits de código precedieron a los specs; las tareas 000–012 se reconstruyeron retrospectivamente. El ciclo completo especificar → planificar → tareas → implementar queda acreditado como práctica aplicada en el incremento 013 y continuada en 014, no como historial completo del proyecto.

## Mapa breve del repositorio relevante

```text
AGENTS.md                         Contexto, roles, stack y coordinación del proyecto
ESTADO.md                         Auditoría del estado real y deuda técnica
README.md                         Presentación/documentación general
datos_barberia.md                 Fuente de conocimiento usada por el RAG
opencode.json                     Instrucciones y declaraciones de servidores MCP
docs/sdd/                         Registro y propuestas de mejoras SDD
specs/                            Arquitectura y especificaciones 000–014
backend/
  server.js                       Arranque del servidor Express
  prisma/schema.prisma            Modelos persistidos y relaciones
  src/
    app.js                        Configuración HTTP y montaje de rutas
    routes/                       Contratos REST
    controllers/                  Adaptación request/response
    services/                     Reglas/orquestación, Prisma e integraciones
    agent/                        LLM, prompt, tools, RAG y conversaciones
    mcp/                          Cliente y servidores MCP
    middlewares/                  Sesión, autorización y errores
    tests/                        Tests automatizados del backend
frontend/
  src/app/                        Rutas y páginas Next.js
  src/components/                 Componentes de UI por feature
  src/lib/api/                    Cliente REST tipado por recurso
  src/lib/hooks/                  Estado y carga de datos de UI
  src/types/api.ts                Tipos compartidos de respuesta/solicitud
chatbot-rag/                      Prototipo RAG Python por consola, separado del flujo web actual
```

Los directorios `node_modules/`, `.next/`, cachés, registros, bases de vectores y archivos de credenciales son dependencias, salidas o datos locales; no son capas de dominio ni deben exponerse durante la defensa. No leer ni compartir el contenido de secretos/credenciales.

## 1. Narrativa de AI Engineering: del prototipado a DDD

### Fase 1 — Prototipado rápido y validación de la funcionalidad base

Una manera fiel al repositorio de explicar esta fase es describirla como una **primera línea funcional iterativa**, sin atribuirle un proceso histórico que el repositorio no demuestra:

1. **Validación de la experiencia web:** las rutas de Next.js en `frontend/src/app/` y los componentes por flujo permitieron construir y ajustar catálogo, autenticación, wizard de reserva, panel y chat con feedback visual temprano. Tailwind CSS permitió iterar sobre los estados de carga, error, vacío y confirmación sin esperar a una arquitectura de frontend más compleja.
2. **Conexión con backend real:** la interfaz se conecta por HTTP a Express mediante `frontend/src/lib/api/client.ts` y clientes específicos como `frontend/src/lib/api/turnos.ts` y `frontend/src/lib/api/auth.ts`. Esto valida contratos y persistencia, no solamente pantallas estáticas.
3. **Validación de negocio:** la reserva se contrasta en el servidor antes de persistirse: servicio y barbero activos, fecha futura, jornada laboral, solapamientos y bloqueos. La UI puede mostrar franjas disponibles, pero el backend vuelve a validar para no confiar en el estado del navegador.
4. **Exploración de IA por incrementos:** el repositorio conserva un RAG Python de consola en `chatbot-rag/chat.py` y una implementación web posterior en LangChain.js bajo `backend/src/agent/` y `backend/src/services/asistente.service.js`. No deben presentarse como una única aplicación conectada: el chat web actual es el del backend Node.js.

**Cómo defender “Vibe Coding” sin exagerar:** puede explicarse como el enfoque de prototipado rápido empleado para descubrir y validar la experiencia, seguido de una etapa de ordenamiento. Sin embargo, `specs/index.md` y `ESTADO.md` dicen explícitamente que los primeros commits de código precedieron a las especificaciones. Por lo tanto, no es correcto afirmar que todo el producto nació con gates SDD o que el historial demuestra el uso inicial de una metodología formal.

### Fase 2 — Refactorización guiada por contexto hacia una arquitectura más explícita

El contexto de arquitectura se concentra en `AGENTS.md`, las especificaciones y planes bajo `specs/`, y la configuración de instrucciones MCP en `opencode.json`. Esos artefactos delimitan roles, tecnologías, responsabilidades y trazabilidad. La auditoría `ESTADO.md` y el índice `specs/index.md` registran el backfill documental y las limitaciones con honestidad.

La evolución observable en código es una **separación por responsabilidades**:

- Rutas HTTP en `backend/src/routes/` declaran los endpoints y guardas de acceso.
- Controllers en `backend/src/controllers/` validan/leen la petición, invocan servicios y construyen respuestas.
- Servicios en `backend/src/services/` concentran los flujos de negocio y coordinan Prisma, notificaciones y Calendar.
- Adaptadores e integraciones en `backend/src/config/` y `backend/src/mcp/` encapsulan configuración y comunicación externa.
- UI Next.js se distribuye por páginas, componentes, hooks y clientes HTTP.

Esto prepara el proyecto para DDD, pero es **DDD-inspirado y todavía híbrido**, no DDD táctico completo. `turnos.service.js`, por ejemplo, consulta Prisma directamente y concentra reglas de reserva, acceso, estados, notificaciones e integración. No existe una entidad `Turno` con comportamiento propio ni un contrato de repositorio que desacople el servicio del ORM. Para defender la decisión: el refactor priorizó separar responsabilidades y estabilizar flujos verificables para el alcance de un local; el siguiente paso sería extraer un modelo de dominio puro sin romper contratos existentes.

### Spec-Driven Development y AI Engineering

`specs/000-arquitectura/` define alcance y arquitectura; las specs `001`–`010` corresponden a los casos de uso principales. `specs/index.md` explica la diferencia entre `spec.md` (qué), `plan.md` (cómo) y `tasks.md` (trabajo verificable). La evidencia de `specs/013-footer-anio/` y `specs/014-chat-reinicio-conversacion/` documenta un ciclo incremental con criterios, tareas, cambios, tests y límites.

La defensa sólida no es “la IA generó el sistema completo”, sino: **la IA se usa dentro de un contexto acotado por arquitectura, specs y contratos; el equipo inspecciona el código generado, conserva reglas críticas en el servidor, y valida mediante tests/build/lint cuando hay evidencia disponible**. La trazabilidad reduce decisiones implícitas y permite distinguir requisito, implementación y deuda.

## 2. Mapa arquitectónico y aplicación de DDD

### 2.1 Dominio: reglas existentes y lo que falta

**No hay una carpeta `domain/` ni módulos de entidades, value objects, agregados o interfaces de repositorios en el árbol actual.** Las entidades persistentes son modelos de datos Prisma; las reglas viven, en su mayoría, en servicios de aplicación que acceden directamente al ORM.

| Concepto de negocio | Ubicación actual | Regla que realmente aplica |
|---|---|---|
| Turno / ciclo de vida | `backend/src/services/turnos.service.js`; enum y modelo `Turno` en `backend/prisma/schema.prisma` | `crear` rechaza fecha pasada, calcula fin usando duración del servicio, comprueba jornada, solapamiento y bloqueo. Estados permitidos y transiciones están en `TRANSICIONES_VALIDAS`. |
| Horario y franjas | `backend/src/services/barberos.service.js` | `validarHorario` verifica jornada y días configurados; `disponibilidad` calcula slots futuros y excluye turnos ocupados y bloqueos. |
| Bloqueos | `backend/src/services/barberos.service.js`; modelo `Bloqueo` en Prisma | CRUD de intervalos con fecha fin posterior a inicio; los bloqueos se excluyen de disponibilidad y se chequean al crear/reprogramar. |
| Cliente / autorización | `backend/src/services/turnos.service.js`; middlewares `backend/src/middlewares/auth.middleware.js` | Verifica dueño del turno, barbero asignado o admin según operación. |
| Servicio | `backend/src/services/servicios.service.js`; modelo `Servicio` en Prisma | Comprueba existencia y condición `activo`; duración define el fin del turno. |
| Passkey | `backend/src/services/auth.service.js`; modelo `CredencialPasskey` en Prisma | Verifica challenge/origen/RP WebAuthn, credencial pública y contador anti-replay. |
| Notificación | `backend/src/services/notificaciones.service.js` y `turnos.service.js`; modelo `Notificacion` | Genera registros en cambios de reserva/estado; lectura limitada al usuario dueño. |

**No están implementadas como reglas de dominio puras:**

- No hay tipos inmutables/Value Objects para `Fecha`, `Horario`, `Precio`, `Duración`, `EstadoTurno` o `Intervalo`.
- No hay repositorios abstractos ni repositorios concretos separados; el código de servicio llama a `prisma.*`.
- No hay regla/modelo de feriados globales. La disponibilidad respeta días configurados, pero no un calendario festivo.
- La regla de cancelación se configura vía `VENTANA_CANCELACION_HORAS`; el valor por defecto `0` desactiva el límite, discrepando con la política de dos horas que documenta `datos_barberia.md` (`ESTADO.md`, deuda técnica).
- El esquema enumera estados, pero la validación de transiciones es lógica imperativa del servicio, no comportamiento de entidad.

### 2.2 Aplicación / casos de uso

Los servicios siguientes cumplen actualmente el papel de **servicios de aplicación/orquestación**, aunque no se llamen use cases ni estén aislados de persistencia:

- `backend/src/services/auth.service.js`: opciones/verificación de registro y login WebAuthn, carga de sesión.
- `backend/src/services/servicios.service.js`: lectura, alta, actualización y desactivación del catálogo.
- `backend/src/services/turnos.service.js`: creación, consulta, cancelación, reprogramación, cambios de estado y notas.
- `backend/src/services/barberos.service.js`: disponibilidad, agenda, métricas del barbero y bloqueos.
- `backend/src/services/clientes.service.js`: búsqueda, listado e historial de visitas.
- `backend/src/services/notificaciones.service.js`: consulta, marcado de lectura y creación.
- `backend/src/services/integraciones.service.js`: coordinación de Calendar, persistencia del ID externo y degradación resiliente.
- `backend/src/services/asistente.service.js`: RAG, ciclo de herramientas, contexto conversacional e invocación de servicios existentes.
- `backend/src/services/metricas.service.js`: agregación de indicadores.

### 2.3 Infraestructura y datos

- **Persistencia de la aplicación:** `backend/src/config/prisma.js`, `backend/prisma/schema.prisma`, `backend/prisma/migrations/` y `backend/prisma/seed.js`. Los servicios utilizan Prisma sobre PostgreSQL; el cliente usa la configuración de entorno.
- **Passkeys y sesión:** `backend/src/utils/challengeStore.js`, `backend/src/utils/session.js`, `backend/src/config/env.js`, `backend/src/middlewares/auth.middleware.js`, `backend/src/services/auth.service.js`. WebAuthn usa `@simplewebauthn/server`; la sesión se mantiene en cookie firmada/HttpOnly.
- **MCP PostgreSQL local:** `backend/src/mcp/postgres/server.js`, lanzado como `npm run mcp:postgres` y declarado como `postgres-local` stdio en `opencode.json`. Expone `list_tables` y `describe_table`; ambas consultan `information_schema` y son de inspección. El servidor dice explícitamente que no es importado por la aplicación ni participa del runtime.
- **MCP Calendar externo:** servidor autónomo `backend/src/mcp/google-calendar/server.js`; cliente MCP HTTP `backend/src/mcp/client.js`; adaptador `backend/src/mcp/google-calendar.js`; orquestación `backend/src/services/integraciones.service.js`. El servicio de Calendar usa el cliente `googleapis`; el backend de turnos no debe llamar directamente a Google.
- **RAG y proveedor LLM:** `backend/src/agent/llm.js`, `backend/src/agent/embeddings.js`, `backend/src/agent/vectorStore.js`, `backend/src/agent/conversations.js`; el archivo fuente de conocimiento es `datos_barberia.md` y la base vectorial queda en `backend/data/vector_db.json`.
- **Configuración:** `backend/src/config/env.js`, `backend/.env.example`, `opencode.json`. Las credenciales locales y `.env` no forman parte de este informe.

### 2.4 Presentación, API y recorrido de request

- **Arranque:** `backend/server.js` carga la app de `backend/src/app.js`; esta configura CORS/body parsing/cookies, monta `backend/src/routes/index.js` bajo `/api` y agrega middleware de 404/errores.
- **API:** `backend/src/routes/` agrupa autenticación, servicios, barberos, turnos, clientes, disponibilidad, asistente/chat, notificaciones, integraciones y métricas. Cada módulo conecta con controllers.
- **Controllers:** `backend/src/controllers/` traduce HTTP al servicio. Ejemplo de reserva: `turnos.routes.js` → `turnos.controller.js` → `turnos.service.js`.
- **Frontend:** `frontend/src/app/` contiene rutas `/`, `/servicios`, `/registro`, `/login`, `/reservar`, `/mis-turnos`, `/panel`, `/panel/clientes`, `/panel/configuracion` y `/panel/metricas`. Los componentes de feature están en `frontend/src/components/`; hooks y llamadas tipadas en `frontend/src/lib/`.
- **Acceso:** `backend/src/middlewares/auth.middleware.js` valida la sesión/roles en servidor; los controles visuales de frontend mejoran la UX pero no sustituyen las guardas del backend.
- **Server Actions:** no se encontraron Server Actions como mecanismo de negocio; la UI usa clientes REST desde el navegador.

**Esquema de capas real:**

```text
Next.js pages/components/hooks
          │ HTTP JSON (frontend/src/lib/api)
          ▼
Express routes → controllers → services
                               ├── Prisma → PostgreSQL (runtime)
                               ├── MCP Calendar client → MCP Calendar → Google Calendar
                               ├── LangChain tools → services de negocio
                               └── Prisma para notificaciones y datos

Agente de desarrollo → MCP PostgreSQL stdio (inspección de esquema, no runtime)
```

## 3. Matriz de trazabilidad: 10 casos de uso vs. código real

La numeración se corresponde con las features `001`–`010` y con el CU-01…CU-10 referido en `ESTADO.md`. “Dominio” en la tabla identifica reglas/modelos reales; no presupone entidades DDD puras.

| # | Caso de uso y estado | Frontend | API / aplicación | Dominio / integración y límite |
|---|---|---|---|---|
| 1 | **Registro y autenticación Passkeys — implementado** (`specs/001-registro-passkeys/`) | `frontend/src/app/registro/page.tsx`, `frontend/src/components/auth/RegistroForm.tsx`, `frontend/src/app/login/page.tsx`, `frontend/src/components/auth/LoginForm.tsx`, `frontend/src/lib/api/auth.ts`, `frontend/src/lib/hooks/useSesion.ts`, `frontend/src/lib/hooks/useWebAuthnSoportado.ts` | `backend/src/routes/auth.routes.js` → `backend/src/controllers/auth.controller.js` → `backend/src/services/auth.service.js`; sesión y protección en `backend/src/utils/session.js`, `backend/src/utils/challengeStore.js` y `backend/src/middlewares/auth.middleware.js` | `Usuario` y `CredencialPasskey` en `backend/prisma/schema.prisma`. El servicio usa challenges, origen/RP, verificación WebAuthn y actualización del contador. El flujo inicia sesión al completar registro. |
| 2 | **Exploración del catálogo — implementado** (`specs/002-catalogo-servicios/`) | `frontend/src/app/servicios/page.tsx`, `frontend/src/components/servicios/ServicioCard.tsx`, `frontend/src/components/servicios/ServicioFormModal.tsx`, `frontend/src/lib/hooks/useServicios.ts`, `frontend/src/lib/api/servicios.ts` | `backend/src/routes/servicios.routes.js` → `backend/src/controllers/servicios.controller.js` → `backend/src/services/servicios.service.js` | Modelo `Servicio` de Prisma (`nombre`, `descripcion`, `duracionMin`, `precio`, `activo`). Público puede consultar; alta/edición/desactivación requiere admin. |
| 3 | **Reserva de turnos — implementado** (`specs/003-reserva-turnos/`) | `frontend/src/app/reservar/page.tsx`, `frontend/src/components/reservar/ReservarWizard.tsx`, pasos `StepServicio.tsx`, `StepBarbero.tsx`, `StepFechaHora.tsx`, `StepConfirmacion.tsx`, selector `SelectorFranjas.tsx`; datos por `frontend/src/lib/hooks/useDisponibilidad.ts`, `frontend/src/lib/api/barberos.ts` y `frontend/src/lib/api/turnos.ts` | `backend/src/routes/turnos.routes.js`, `backend/src/controllers/turnos.controller.js`, `backend/src/services/turnos.service.js`; disponibilidad: `backend/src/routes/barberos.routes.js` → `backend/src/controllers/barberos.controller.js` → `backend/src/services/barberos.service.js` | `Turno`, `Servicio`, `Barbero`, `Bloqueo` en Prisma. `crear` recalcula duración, jornada y fechas; en transacción busca cruce y bloqueo, persiste turno y notificaciones; intenta Calendar después. La API es autoridad aunque la UI muestre slots. |
| 4 | **Gestión de turnos del cliente — implementado** (`specs/004-gestion-turnos-cliente/`) | `frontend/src/app/mis-turnos/page.tsx`, `frontend/src/components/turnos/TurnoCard.tsx`, `CancelarTurnoDialog.tsx`, `ReprogramarDialog.tsx`, `frontend/src/lib/hooks/useTurnos.ts`, `frontend/src/lib/api/turnos.ts` | `PATCH /api/turnos/:id/cancelar` y `/reprogramar` en `backend/src/routes/turnos.routes.js`; controladores en `backend/src/controllers/turnos.controller.js`; reglas en `backend/src/services/turnos.service.js` | Comprueba propiedad, estado no terminal, turno futuro, ventana de cancelación si está configurada, jornada, cruces y bloqueos. Reprogramar conserva servicio/barbero y recalcula fin. |
| 5 | **Panel de barberos/administrador — implementado** (`specs/005-panel-barberos/`) | `frontend/src/app/panel/layout.tsx`, `frontend/src/app/panel/page.tsx`, `frontend/src/components/panel/TurnoPanelCard.tsx`, hooks `useMiAgenda.ts`, `useTurnos.ts`, clientes `frontend/src/lib/api/barberos.ts` y `turnos.ts`; métricas en `frontend/src/app/panel/metricas/page.tsx` | Endpoints `/api/barberos/me/agenda`, `/api/barberos/:id/agenda`, `/api/turnos/:id/estado`; `backend/src/routes/barberos.routes.js`, `turnos.routes.js`; servicios `barberos.service.js` y `turnos.service.js` | Roles aplicados en `auth.middleware.js`; admin puede operar sobre agenda global y barbero sobre su agenda. El servidor valida transiciones; agenda excluye cancelados. La UI ofrece filtro por barbero al admin. |
| 6 | **Asistente inteligente LangChain — parcial** (`specs/006-chatbot-langchain/`, incremento `014-chat-reinicio-conversacion/`) | `frontend/src/components/chat/ChatWidget.tsx` llama `POST /api/chat`, restaura y borra historial con `/api/asistente/historial`; se incluye en el layout principal | `backend/src/routes/chat.routes.js`, `asistente.routes.js` → `backend/src/controllers/asistente.controller.js` → `backend/src/services/asistente.service.js`; agente/tooling en `backend/src/agent/tools.js`, `prompts.js`, `llm.js`, `vectorStore.js`, `embeddings.js`, `conversations.js` | Tools reales: consultar disponibilidad, reservar, ver turnos propios y cancelar; delegan en `barberos.service.js` y `turnos.service.js`. Hay persistencia JSON y control de propiedad de conversación. Falta completar pruebas del agente/E2E y resolver contradicción entre prompt/tools y política en `datos_barberia.md`. `chatbot-rag/chat.py` es CLI Python separado, no el endpoint web actual. |
| 7 | **Sincronización calendario MCP — parcial** (`specs/007-sync-calendario-mcp/`) | `frontend/src/app/panel/configuracion/page.tsx`, `frontend/src/components/integraciones/CalendarStatusCard.tsx`, `SyncTurnoButton.tsx`, `frontend/src/lib/api/integraciones.ts`, `frontend/src/lib/hooks/useCalendarEstado.ts` | Llamadas en `backend/src/services/turnos.service.js`; orquestador `backend/src/services/integraciones.service.js`; endpoints en `backend/src/routes/integraciones.routes.js` y controller asociado | Cliente `backend/src/mcp/client.js`, adaptador `google-calendar.js`, servidor `backend/src/mcp/google-calendar/server.js`. En alta crea evento; reprogramar actualiza; cancelar elimina. Fallos no impiden persistencia y se reflejan como resultado pendiente/log, pero no hay evidencia de validación real E2E ni de outbox/reintentos persistentes. |
| 8 | **Gestión de disponibilidad — parcial** (`specs/008-gestion-disponibilidad/`) | `frontend/src/components/panel/BloqueosManager.tsx`, `frontend/src/lib/hooks/useMisBloqueos.ts`, `useDisponibilidad.ts`, clientes `frontend/src/lib/api/barberos.ts` | `/api/barberos/me/bloqueos` GET/POST/DELETE, `/api/barberos/me/disponibilidad` GET y disponibilidad pública según rutas; implementación en `backend/src/services/barberos.service.js`. | Modelo `Bloqueo`; creación valida fin posterior al inicio. La disponibilidad excluye bloqueos. **No hay feriados globales ni edición de horario semanal expuesta**: `/api/disponibilidad` está vacío y el plan registra endpoints ausentes como deuda. No afirmar “bloqueo de feriados implementado”. |
| 9 | **Historial de visitas — parcial** (`specs/009-historial-visitas/`) | Historial personal en `frontend/src/app/mis-turnos/page.tsx`; ficha de staff en `frontend/src/app/panel/clientes/page.tsx`, `frontend/src/components/panel/FichaCliente.tsx`, `TurnoHistorialCard.tsx`; hooks `useHistorialCliente.ts`, `useClientes.ts` | `GET /api/clientes/:id/historial` y `/api/clientes` en `backend/src/routes/clientes.routes.js`, `clientes.controller.js` y `clientes.service.js`; nota de turno en `turnos.service.js` | Historial staff lista turnos pasados, resumen de completados, gasto total y última visita; permite notas por turno. El plan de ficha de cliente/preferences (`/api/clientes/me/ficha`, `/api/clientes/:id/ficha`) no está completo. |
| 10 | **Notificaciones de estado — parcial** (`specs/010-notificaciones-estado/`) | `frontend/src/components/layout/NotificationBell.tsx`, `frontend/src/lib/hooks/useNotificaciones.ts`, `frontend/src/lib/api/notificaciones.ts`; feedback de acción en `frontend/src/components/ui/StatusMessage.tsx` | `backend/src/routes/notificaciones.routes.js`, `notificaciones.controller.js`, `notificaciones.service.js`; disparadores dentro de `turnos.service.js` | Modelo `Notificacion` en Prisma. Persisten notificaciones in-app para confirmación/cambios, y el usuario puede leerlas/marcarlas. No hay proveedor de email, preferencias ni recordatorios programados. El flujo de reprogramación no acredita una notificación dedicada de “reprogramado”. |

### Estado resumido para decirlo claramente

`ESTADO.md` clasifica como implementadas 000–005, 011 y 012; 006–010 y 014 como parciales. Las partes parciales no equivalen a “cero código”: significan que hay un subconjunto verificable y que faltan criterios, tests, endpoints o validación final indicados en el registro. Conviene separar **existencia de código** de **criterios de aceptación totalmente verificados**.

## 4. Defensa de integraciones clave: MCP y LangChain

### 4.1 Model Context Protocol

#### Servidor PostgreSQL local

- **Declaración para el agente de desarrollo:** `opencode.json`, servidor `postgres-local`, comando `node src/mcp/postgres/server.js`, `cwd: backend`, transporte local stdio.
- **Implementación:** `backend/src/mcp/postgres/server.js` registra `list_tables` y `describe_table` con el SDK `@modelcontextprotocol/sdk`, `StdioServerTransport` y el cliente `pg`.
- **Alcance real:** ambas herramientas leen `information_schema`. No exponen CRUD sobre tablas de negocio ni forman el camino de persistencia de reservas.
- **Camino de datos de la app:** servicios Node usan `backend/src/config/prisma.js`/Prisma y `DATABASE_URL`. Explicación para el tribunal: “MCP PostgreSQL sirve como herramienta acotada de inspección del esquema para el agente durante desarrollo; el backend transaccional sigue usando Prisma. No confundimos herramienta de desarrollo con arquitectura de runtime”.

#### Servidor externo de Google Calendar

- **Declaración:** `opencode.json` contiene `google-calendar` remoto en `http://localhost:8000/mcp` (configuración para el entorno de herramientas).
- **Proceso servidor:** `backend/src/mcp/google-calendar/server.js` inicia Express, implementa el intercambio MCP JSON-RPC/HTTP y registra tools `crearEvento`, `actualizarEvento`, `eliminarEvento`, `consultarEventos`, `verificarConexion`. La API de calendario se ejecuta con `googleapis` y una cuenta de servicio u OAuth configurada fuera del código.
- **Cliente/adaptador:** `backend/src/mcp/client.js` hace inicialización y llamadas `tools/call`; `backend/src/mcp/google-calendar.js` mapea operaciones de calendario a esas tools, agrega calendario y zona horaria y usa `MCP_CALENDAR_URL`, token y timeout de entorno.
- **Invocación al reservar:** `backend/src/services/turnos.service.js` persiste primero el turno y luego invoca `integracionesService.sincronizarAlta`. Ese servicio llama el adaptador; si devuelve `eventId`, lo guarda en `Turno.googleEventId`. Para reprogramar se actualiza el evento asociado; al cancelar se elimina. Ante falla la operación local se conserva y el servicio retorna un estado pendiente con advertencia.
- **Límite acreditado:** la estructura y el código de integración están presentes, pero `ESTADO.md` y `specs/007-sync-calendario-mcp/spec.md` describen la feature como parcial y no acreditan una operación E2E satisfactoria con credenciales reales.

### 4.2 Agente LangChain y conexión con la UI

1. **Entrada web:** `frontend/src/components/chat/ChatWidget.tsx` realiza `POST /api/chat`, muestra respuesta/herramientas llamadas, restaura el historial autenticado y permite reiniciarlo mediante el endpoint de historial.
2. **Rutas/identidad:** `backend/src/routes/chat.routes.js` protege el chat con autenticación; `backend/src/routes/asistente.routes.js` protege envío, lectura y limpieza del historial. `backend/src/controllers/asistente.controller.js` valida que el mensaje exista y no supere 2000 caracteres, y delega al servicio.
3. **Orquestación:** `backend/src/services/asistente.service.js` prepara contexto recuperado y catálogo vigente, recupera conversación de propiedad del usuario, enlaza tools al LLM y ejecuta el ciclo de herramientas con máximo cinco iteraciones.
4. **Prompt y herramientas:** `backend/src/agent/prompts.js` contiene `PROMPT_AGENTE`, exige español, prohíbe inventar datos y ordena pedir confirmación antes de reservar o cancelar. `backend/src/agent/tools.js` define:
   - `consultar_disponibilidad` → `barberosService.disponibilidad`.
   - `reservar_turno` → exige sesión y delega en `turnosService.crear`; el cliente se toma del usuario autenticado, no de argumentos del modelo.
   - `consultar_mis_turnos` → lista solo turnos del usuario y limita resultados futuros.
   - `cancelar_turno` → valida UUID/sesión y delega en `turnosService.cancelar`, que verifica propiedad.
5. **Conocimiento RAG:** `backend/src/agent/vectorStore.js` lee/ingesta `datos_barberia.md`, divide en fragmentos y persiste embeddings en `backend/data/vector_db.json`; `backend/src/agent/embeddings.js` define embeddings locales; `backend/src/agent/llm.js` selecciona Groq u Ollama.
6. **Datos exactos del catálogo:** `asistente.service.js` combina fragmentos RAG con catálogo y barberos actuales leídos desde servicios. El precio/duración del catálogo viene de la aplicación, no solo del texto recuperado.
7. **Persistencia de conversación:** `backend/src/agent/conversations.js` usa JSON; el servicio valida propiedad de la conversación para evitar reutilizar sesiones ajenas.

**Diferencia entre el prototipo Python y la app:** `chatbot-rag/chat.py` usa LangChain con Chroma y proveedor Groq/Ollama en modo CLI; no es el agente que atiende el componente Next.js actual. La UI actual se integra con el agente Node de `backend/src/services/asistente.service.js`.

**Limitación de coherencia del conocimiento:** `datos_barberia.md` dice que el asistente no puede crear ni cancelar turnos, mientras que `PROMPT_AGENTE` y las tools actuales sí permiten esas acciones con sesión y confirmación. La respuesta técnica correcta es reconocer la deuda, explicar que las restricciones efectivas también se imponen en tools y servicios, y proponer alinear fuente RAG/prompt con la política aprobada antes de extender el alcance.

## 5. Guion de defensa: preguntas incisivas y respuestas

### Pregunta 1 — “¿Dónde está realmente el dominio? ¿Por qué dicen DDD si no hay entidades ni repositorios?”

**Respuesta oral sugerida:**  
“La implementación actual es híbrida. Tenemos separación por responsabilidades y módulos de negocio: rutas y controllers reciben HTTP, los servicios coordinan casos de uso, Prisma persiste y los adaptadores aíslan Calendar. Pero no afirmamos que haya DDD táctico completo: las reglas viven en `turnos.service.js` y `barberos.service.js`, acopladas a Prisma, y no hay entidades ricas, value objects ni interfaces de repositorio. La decisión fue primero estabilizar el flujo y explicitar los límites; la evolución coherente sería extraer `Turno` y `Disponibilidad` como modelo puro, con repositorios, conservando los contratos de API ya cubiertos por specs y tests.”

### Pregunta 2 — “¿El proyecto fue desarrollado desde el comienzo con Spec-Driven Development?”

**Respuesta oral sugerida:**  
“No sostenemos eso. La auditoría y el índice indican que los primeros commits de código son anteriores a las specs y que los tasks de las features iniciales se reconstruyeron retrospectivamente; el backfill mejora trazabilidad, pero no demuestra un uso histórico. Sí podemos mostrar el proceso aplicado en los incrementos recientes: spec con criterios, plan técnico, tasks verificables, implementación y evidencia de lint/tests/build según la feature. Esto nos permite describir una maduración del proceso, no reescribir la historia.”

### Pregunta 3 — “¿Por qué hablan de PostgreSQL MCP si la app usa Prisma?”

**Respuesta oral sugerida:**  
“Son dos responsabilidades distintas. La aplicación transaccional usa Prisma directamente desde los servicios y obtiene sus datos de PostgreSQL. El servidor MCP local está declarado para el entorno de desarrollo y solo inspecciona metadatos del esquema con `list_tables` y `describe_table`; no ejecuta reservas y no está conectado a los controllers. Calendar, en cambio, sí se consume desde la aplicación a través de un cliente MCP y un adaptador aislado. La distinción evita atribuir al MCP de PostgreSQL un papel que el código no tiene.”

### Pregunta 4 — “¿Qué garantiza que el chatbot no invente disponibilidad o reserve para otra persona?”

**Respuesta oral sugerida:**  
“El prompt orienta al modelo, pero no es nuestra frontera de seguridad. Las tools validan sesión y formato, la reserva obtiene el `clienteId` de la identidad autenticada y reutiliza `turnos.service.js`, que vuelve a calcular duración, jornada, solapamientos y bloqueos antes de persistir. La cancelación valida que el turno pertenezca al usuario. Para precios/duración, se incorpora el catálogo vigente del backend además del RAG. Reconocemos dos límites: faltan pruebas end-to-end específicas del agente y el documento `datos_barberia.md` contradice el alcance de las tools; ambos están señalados en el estado como trabajo pendiente.”

## Frases útiles y no exageradas para el cierre

- “La disponibilidad que muestra la UI es orientativa; la decisión final se revalida en backend.”
- “Las reglas críticas están del lado servidor, aunque todavía no se hayan extraído a un dominio puro.”
- “MCP PostgreSQL inspecciona el esquema en desarrollo; Prisma resuelve las transacciones de la aplicación.”
- “La sincronización externa está diseñada para degradar con resiliencia, pero la validación real con Calendar sigue siendo parcial.”
- “El estado parcial indica criterios pendientes de verificar o endpoints faltantes; no significa que todo el feature carezca de implementación.”
- “La documentación retrospectiva aporta trazabilidad, pero no la presentamos como evidencia de que el proceso se siguió desde el primer commit.”

## Fuentes del repositorio para consultar durante la exposición

- Arquitectura y decisiones: `specs/000-arquitectura/plan.md`
- Índice y estado de features: `specs/index.md`
- Auditoría de implementación/deuda: `ESTADO.md`
- Modelo persistente: `backend/prisma/schema.prisma`
- Flujo de reserva: `backend/src/routes/turnos.routes.js`, `backend/src/controllers/turnos.controller.js`, `backend/src/services/turnos.service.js`
- Disponibilidad y bloqueos: `backend/src/routes/barberos.routes.js`, `backend/src/services/barberos.service.js`, `frontend/src/components/panel/BloqueosManager.tsx`
- Agente web: `backend/src/services/asistente.service.js`, `backend/src/agent/tools.js`, `backend/src/agent/prompts.js`, `frontend/src/components/chat/ChatWidget.tsx`
- MCP: `opencode.json`, `backend/src/mcp/postgres/server.js`, `backend/src/mcp/client.js`, `backend/src/mcp/google-calendar.js`, `backend/src/mcp/google-calendar/server.js`
- Trazabilidad de los diez casos: `specs/001-registro-passkeys/` a `specs/010-notificaciones-estado/`
