# Proyecto Barbería Constitution

## Core Principles

### I. Spec Antes que Código (NON-NEGOTIABLE)
Ninguna línea de código se escribe sin una especificación aprobada. El flujo es estrictamente secuencial: no se avanza al paso N+1 sin cerrar y verificar el paso N. Cada paso produce un artefacto versionado (`spec.md`, `plan.md`, código + tests). Si durante la implementación la spec resulta insuficiente o incorrecta, se detiene la codificación, se vuelve a la spec, se corrige y recién entonces se reimplementa. Un supuesto no documentado es un bug futuro: ante duda, se pregunta antes de asumir.

### II. Gates Secuenciales No Negociables (NON-NEGOTIABLE)
Los 4 gates del flujo son obligatorios y en este orden:
1. **GATE 1 — Requerimientos**: requerimiento confirmado por el usuario, casos de uso y reglas de negocio listados, ambigüedades resueltas o marcadas como supuestos, alcance y fuera-de-alcance definidos.
2. **GATE 2 — Specs**: spec completa (historias, contratos, modelo de datos, criterios de aceptación verificables), aprobada por el usuario y descompuesta en tareas atómicas.
3. **GATE 3 — Código**: cada criterio de aceptación tiene su implementación, sin funcionalidad no especificada, sin errores de lint.
4. **GATE 4 — Testing**: todos los criterios de aceptación en verde, sin regresiones, bugs y limitaciones documentados, spec marcada como Implementada/Verificada.

No se saltean gates. Si un gate falla, se detiene la codificación y se corrige el artefacto del gate anterior.

### III. Contratos Primero
Backend y Frontend se comunican **únicamente** a través de los contratos de API definidos en las specs. No se inventan campos, endpoints ni respuestas fuera de la spec. Los tipos de request/response se derivan de las specs y viven en módulos de tipos compartidos. Toda adición a un contrato exige antes actualizar la spec (y su aprobación).

### IV. Testing Obligatorio (NON-NEGOTIABLE)
Nada está terminado sin pruebas. Toda funcionalidad nueva incluye pruebas unitarias y/o de integración: al menos el caso feliz y un caso de error por endpoint, y un test de aceptación por cada criterio de aceptación de la spec. Se verifican regresiones antes de dar una tarea por cerrada. Diagnosticar la causa raíz de un fallo; nunca parchear a ciegas.

### V. Modularidad y Capas
La lógica de negocio vive en `backend/src/services/`; las rutas no contienen lógica de negocio y los servicios no conocen HTTP. MCP está encapsulado en `backend/src/mcp/`: ningún módulo fuera de `mcp/` habla directamente con la base de datos o la API de Google. El chatbot **no duplica reglas**: sus tools son finas y delegan en los mismos services que usa la API REST. La UI nunca accede a la base de datos directamente, siempre vía API. Preferir composición sobre monolitos; cambios mínimos y localizados; no romper código existente.

## Restricciones Técnicas

- **Stack obligatorio**: Frontend Next.js (App Router) + Tailwind CSS; Backend Node.js (API REST); Chatbot con LangChain (agente + tools); integración con MCP (Model Context Protocol) para PostgreSQL (local) y Google Calendar (externo); datos en PostgreSQL.
- **Seguridad y secretos**: nunca exponer ni loguear secretos, tokens o credenciales; nunca hardcodear secretos — usar exclusivamente variables de entorno (`.env`); las credenciales OAuth de Google se manejan solo por variables de entorno.
- **Validación de entrada**: toda entrada del usuario se valida y sanea en la capa de API antes de llegar a los services; los services revalidan reglas de negocio.
- **Datos personales**: minimizar y proteger los datos de clientes; las observaciones de fichas no se exponen a otros clientes.
- **Idioma**: toda documentación, spec y comunicación del proyecto es en español (identificadores y código pueden permanecer en inglés por convención).
- **Sin dependencias nuevas** sin justificación y aprobación del Tech Lead.

## Roles y Herencia

El proyecto define 3 roles. Un solo rol activo por turno, declarado al inicio del trabajo.

### Tech Lead / Arquitecto
- Traduce requerimientos a especificaciones (specs, contratos de API, modelo de datos, criterios de aceptación).
- Diseña la arquitectura, evalúa trade-offs y riesgos, define las `tools` del agente y los contratos MCP.
- **Tiene la última palabra en decisiones de arquitectura y contratos.** Aprueba specs y revisa el trabajo de los demás roles.
- Resuelve las ambigüedades que escalan Backend y Frontend.

### Backend Developer
- Implementa endpoints, servicios, acceso a datos, integraciones MCP y tools de LangChain **exactamente** según la spec aprobada.
- **No modifica la spec por conveniencia**: si algo falta o contradice la implementación, se escala al Tech Lead y se vuelve al gate correspondiente.
- Responsable de tests de backend y de la validación de errores.

### Frontend Developer
- Implementa vistas y flujos consumiendo **únicamente** los contratos de API aprobados, con estados de carga, error y vacío, responsive y accesibilidad.
- **No modifica la spec por conveniencia** ni inventa campos/endpoint fuera del contrato; los gaps se escalan al Tech Lead.
- Responsable de la consistencia visual y la reutilización de componentes.

**Herencia entre roles**: toda decisión del Tech Lead (contratos, arquitectura, modelo de datos) es vinculante para Backend y Frontend; los entregables de Backend/Frontend deben poder rastrearse a una spec concreta (`specs/NNN-nombre/spec.md`).

## Governance

- Esta constitución **supersedea** cualquier práctica, workflow o convención anterior del proyecto (incluido el flujo SDD previamente documentado en `IA_WORKFLOW.md`).
- Las enmiendas a la constitución requieren **aprobación explícita del usuario**, documentación del cambio y actualización de la fecha `Last Amended`.
- Todo cambio (PR, revisión o tarea) debe verificar el cumplimiento de los principios; las violaciones deben justificarse en `Complexity Tracking` del `plan.md` correspondiente o escalarse al Tech Lead.
- La guía de ejecución en runtime vive en `.specify/memory/`; las specs y planes viven en `specs/NNN-nombre/`.

**Version**: 1.0.0 | **Ratified**: 2026-10-20 | **Last Amended**: 2026-10-20
