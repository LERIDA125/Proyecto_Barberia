# Implementation Plan: Entorno de desarrollo contenedorizado (frontend + backend)

**Branch**: `015-entorno-docker-compose` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

## Summary

Crear un entorno de desarrollo con Docker Compose que levante el frontend Next.js (puerto 3001) y el backend Express/Prisma (puerto 3000) con recarga en vivo, montando el código del host y aislando `node_modules` y `.next` en volúmenes propios. El backend se conecta al PostgreSQL que ya corre en el host mediante `host.docker.internal`. No se modifica código de la aplicación, contratos ni scripts.

## Technical Context

**Language/Version**: Node.js 20 LTS (imagen `node:20-bookworm-slim`).

**Primary Dependencies**: Docker Engine + Docker Compose v2; Next.js 16 (Turbopack); Express 5 + nodemon; Prisma 7.

**Storage**: PostgreSQL 16 en el host (fuera del compose), accedido desde el backend vía `host.docker.internal:5432`.

**Testing**: `docker compose config` (validación estática), arranque real con `docker compose up`, verificación HTTP de `:3001` y `:3000/api/health`, prueba de hot-reload, y lint/typecheck del frontend sin cambios.

**Target Platform**: Desarrollo local en Windows con Docker Desktop (WSL2) y bind mounts.

**Project Type**: Aplicación web (frontend + backend).

**Performance Goals**: El arranque inicial puede tardar por `npm install`; los arranques posteriores reutilizan los volúmenes. El hot-reload debe reflejar cambios en segundos.

**Constraints**: Sin dependencias nuevas en la aplicación; sin cambios en `package.json`; sin dockerizar PostgreSQL ni el MCP de Calendar; puertos `3000` y `3001` fijos.

**Scale/Scope**: Entorno de un desarrollador; dos servicios, una red y tres volúmenes nombrados.

## Componentes afectados

| Componente | Cambio |
|---|---|
| `docker-compose.yml` (raíz) | Nuevo archivo con servicios `frontend` y `backend`, red `barberia-net` y volúmenes de dependencias/build. |
| `frontend/Dockerfile.dev` | Nuevo Dockerfile de desarrollo basado en Node 20, instala dependencias y ejecuta `npm run dev`. |
| `frontend/.dockerignore` | Nuevo archivo que excluye `node_modules`, `.next`, logs, artefactos y entornos locales. |
| `frontend/next.config.ts` | Ajuste mínimo: `watchOptions.pollIntervalMs` solo cuando `NEXT_WATCH_POLL=true`, para hot-reload con Turbopack sobre bind mounts de Windows. |
| `backend/Dockerfile.dev` | Nuevo Dockerfile de desarrollo con `openssl` (Prisma), dependencias y `npm run dev`. |
| `backend/.dockerignore` | Nuevo archivo que excluye `node_modules`, `data`, logs, `.env` y credenciales. |
| `specs/015-entorno-docker-compose/` | `spec.md`, `plan.md`, `tasks.md` y evidencia. |
| `specs/index.md`, `ESTADO.md`, `README.md` | Registro de la feature y documentación de uso. |

No se modifica código de `frontend/src`, `backend/src`, `backend/prisma`, contratos, rutas ni scripts de `package.json`.

## Enfoque técnico

1. **Frontend**: imagen `node:20-bookworm-slim`, `WORKDIR /app`, `COPY package*.json`, `npm ci`, `COPY . .`, `EXPOSE 3001`, `CMD ["npm", "run", "dev"]`. El script existente ya fija `next dev -p 3001`.
2. **Backend**: imagen `node:20-bookworm-slim`, instala `openssl` (requerido por Prisma), copia manifiestos, `npm ci`, copia el esquema y `prisma.config.mjs`, genera el cliente con una `DATABASE_URL` de build descartable, y termina de copiar el código. `CMD ["npm", "run", "dev"]`.
3. **Compose — frontend**: publica `3001:3001`, monta `./frontend:/app` y volúmenes nombrados en `/app/node_modules` y `/app/.next`; define `NEXT_PUBLIC_API_URL=http://localhost:3000`, `WATCHPACK_POLLING=true`, `CHOKIDAR_USEPOLLING=true` y `NEXT_TELEMETRY_DISABLED=1`; depende de `backend` y se une a `barberia-net`.
4. **Compose — backend**: publica `3000:3000`, monta `./backend:/app`, `./datos_barberia.md:/datos_barberia.md:ro` y un volumen nombrado en `/app/node_modules`; carga `backend/.env` de forma opcional; sobreescribe `DATABASE_URL` con `${DATABASE_URL_DOCKER:-postgresql://usuario:password@host.docker.internal:5432/barberia?schema=public}`; agrega `extra_hosts: host.docker.internal:host-gateway`; ejecuta `npm install && npx prisma generate && npm run dev` para sincronizar dependencias y cliente.
5. **Red**: `barberia-net` tipo bridge. El frontend resuelve el backend por el nombre de servicio `backend` si en el futuro se necesita una llamada server-to-server.
6. **Volúmenes**: `frontend_node_modules`, `frontend_next`, `backend_node_modules`. Evitan que el bind mount de Windows pise los binarios Linux y que `.next` del contenedor ensucie el del host.
7. **Documentación**: sección en `README.md` con `docker compose up`, puertos, variables `DATABASE_URL_DOCKER` y `NEXT_PUBLIC_API_URL`, y limpieza con `docker compose down -v`.

## Decisiones de diseño

- **`node:20-bookworm-slim` en lugar de Alpine**: Prisma y `onnxruntime-node` (usado por `@huggingface/transformers`) publican binarios nativos que pueden fallar en musl. Debian slim reduce ese riesgo con un costo de imagen aceptable para desarrollo. Se documenta la desviación del ejemplo `node:20-alpine`.
- **Polling del watcher de Turbopack**: Turbopack no recibe eventos del bind mount de Windows/OneDrive. Se agrega `watchOptions.pollIntervalMs: 1000` en `next.config.ts`, activado solo por `NEXT_WATCH_POLL=true` desde el compose, para no imponer polling al desarrollo en el host. Verificado con un cambio real de extremo a extremo.
- **Puerto `3001:3001`**: el script real del frontend usa 3001 y el 3000 lo ocupa el backend. Mapear `3000:3000` rompería el contrato actual de CORS y `NEXT_PUBLIC_API_URL`.
- **Volúmenes nombrados para `node_modules` y `.next`**: el bind mount de Windows no debe imponer binarios de otra plataforma ni mezclar cachés de build.
- **`npm install` al iniciar**: garantiza que un cambio en `package.json` se refleje sin borrar volúmenes. El Dockerfile igual instala dependencias para que la imagen sea autónoma.
- **`DATABASE_URL` sobreescribible**: el compose usa una URL por defecto acorde al README y permite `DATABASE_URL_DOCKER` para credenciales distintas, sin editar el compose ni romper la ejecución local en el host.
- **`env_file` opcional**: evita que un clon sin `backend/.env` falle al levantar; los valores por defecto de desarrollo del backend cubren ese caso.
- **Montaje de `datos_barberia.md`**: el RAG lo lee desde la raíz del repo; sin el montaje, la ruta no existe dentro del contenedor.
- **PostgreSQL fuera del compose**: se respeta el flujo documentado del proyecto y el alcance elegido por el usuario.

## Dependencias

- Docker Desktop con Compose v2 o superior.
- PostgreSQL del host en `5432` (contenedor `barberia-postgres` del README).
- `backend/.env` local (opcional para arrancar, necesario para secretos reales).
- Sin dependencias nuevas en `frontend/package.json` ni `backend/package.json`.

## Riesgos

- **Hot-reload que no dispara en Windows**: los bind mounts de Docker Desktop pueden no propagar eventos. Mitigación: `WATCHPACK_POLLING` y `CHOKIDAR_USEPOLLING`; documentar el fallback.
- **Credenciales de PostgreSQL distintas**: la URL por defecto falla. Mitigación: `DATABASE_URL_DOCKER` documentada.
- **Primer arranque lento**: `npm ci` y `npm install` dentro de contenedores. Mitigación: volúmenes persistentes y advertencia en la documentación.
- **Binarios nativos**: Prisma y ONNX Runtime requieren glibc y `openssl`. Mitigación: Debian slim + `openssl`.
- **Conflicto de puertos**: si el host ya corre `npm run dev`, el compose falla. Mitigación: mensaje de error de Compose y documentación para detener los procesos locales.
- **Volumen con dependencias obsoletas**: tras cambiar `package.json`, `npm install` al iniciar lo corrige.
- **`.next` del host**: se aísla en volumen para no corromper el build local.

## Estrategia de pruebas

### Validación estática

- `docker compose config` sin errores y con los puertos, volúmenes y red esperados.
- Verificar que `frontend/.dockerignore` y `backend/.dockerignore` excluyan `node_modules`, `.next`, logs y `.env`.

### Validación funcional

- `docker compose up -d --build`.
- `GET http://localhost:3001` → 2xx.
- `GET http://localhost:3000/api/health` → `{ status: "ok" }`.
- Editar un texto del frontend y confirmar el cambio sin rebuild.
- Editar un archivo del backend y confirmar el reinicio de `nodemon`.
- `docker compose down` sin errores.

### Regresión

- `npm run lint` y `npx tsc --noEmit` en `frontend/` sin errores nuevos.
- `git diff --stat` limitado a los archivos declarados.

## Compatibilidad

- El flujo manual (`npm run dev` en host) sigue funcionando.
- No cambian contratos de API, CORS, puertos públicos ni scripts.
- PostgreSQL y el MCP de Calendar conservan su operación actual.

## Constitution Check

- **I. Spec antes que código:** PASS — spec, plan y tasks creados antes de los Dockerfiles.
- **II. Gates secuenciales:** PASS — alcance confirmado por el usuario; spec y plan definidos antes de implementar.
- **III. Contratos primero:** PASS — no se toca ningún contrato de API.
- **IV. Testing obligatorio:** PASS — validación estática, funcional y de regresión; se registran las limitaciones reales.
- **V. Modularidad y capas:** PASS — solo se agrega infraestructura de desarrollo; no se duplica lógica ni se accede a datos desde la UI.

## Complexity Tracking

Sin violaciones de la constitución que justificar.

## Ruta de implementación

- **Ruta:** inline. Son archivos de configuración y documentación cortos, ya comprendidos, con contexto completo del repositorio. No se delega un writer porque no hay investigación pendiente ni diseño abierto; se mantiene un único hilo de escritura.
