# AGENTS.md

Guía para agentes de código que trabajen en este repositorio.

## Qué es

Daily Bug (repo `daily-insight`): app Next.js (App Router, React 19, CSS Modules) desplegada en Vercel. Cada día genera con IA una curiosidad sobre un bug o glitch histórico de videojuegos, la guarda en PostgreSQL y la muestra como la contraportada de una caja de videoclub. Todo el contenido de la UI y los prompts está en español.

## Comandos

Gestor de paquetes: **pnpm**.

```bash
pnpm install          # postinstall: solo `prisma generate`
pnpm dev              # servidor de desarrollo
pnpm build            # prisma generate + next build (prerenderiza las páginas: necesita BD o DATA_SOURCE=mock)
pnpm lint             # ESLint (eslint-config-next)
pnpm test             # Vitest (tests *.test.ts junto al código en lib/)
pnpm test -- lib/auth.test.ts   # un solo fichero
pnpm db:migrate       # prisma migrate deploy, a mano al desplegar cambios de esquema
```

Nuevas migraciones: `pnpm dlx prisma migrate dev --name <nombre>` (usa `DIRECT_URL` como shadow DB, ver `prisma.config.ts`).

Desarrollar la UI sin base de datos: `DATA_SOURCE=mock pnpm dev` (en PowerShell, `$env:DATA_SOURCE="mock"; pnpm dev`).

## Variables de entorno (`.env` y Vercel)

Se validan en `lib/env.ts` (bajo demanda, no al importar).

- `DATA_SOURCE`: `mock` | `api` (por defecto `api`). Ver «Lectura / UI».
- `DATABASE_URL` y `DIRECT_URL`: Postgres. `DIRECT_URL` solo la usa Prisma para migraciones.
- `OPENAI_API_KEY`: la lee el SDK de agentes.
- `CRON_SECRET`: secreto del cron, de 32 caracteres o más. Vercel lo envía como `Authorization: Bearer …`. Si falta o es corto, el cron responde siempre 401.

## Estructura

- `app/`: solo rutas (páginas, `loading`, `error`, `api/`).
- `components/`: UI. `box/BoxCover` es la caja (lomo + contraportada, compartida por la portada y el archivo); `shelf/` contiene los lomos, la estantería y los estados vacíos; `site/` la cabecera y el pie, montados en `app/layout.tsx`.
- `lib/`: lógica de servidor. `env`, `db` (cliente Prisma), `auth`, `data` (lectura), `insights/` (generación) y `mocks/`.
- `types/bug.ts`: el tipo `BugType`.
- Los módulos de servidor importan `server-only`. En Vitest se sustituye por `test/server-only.ts` (alias en `vitest.config.mts`).
- Alias de rutas: `@/*` apunta a la raíz del repo.

## Arquitectura

### Generación diaria

1. `vercel.json` programa el cron `0 0 * * *` sobre `GET /api/cron/new-insight`.
2. La ruta valida el token con `verifyBearer` (`lib/auth.ts`, en tiempo constante y cerrada por defecto) y llama a `generateDailyInsight()` (`lib/insights/generate.ts`).
3. `generateDailyInsight`:
   1. Calcula la fecha de publicación en el servidor (`lib/insights/date.ts`, hora de Madrid, mes en español con mayúscula inicial).
   2. Si ya existe un bug con esa fecha, devuelve `skipped`, así que es idempotente.
   3. Lee los últimos 30 bugs de la BD para el prompt.
   4. Ejecuta `insightAgent` (`@openai/agents`, `gpt-5-nano`, `outputType: agentOutputSchema`).
   5. Valida el resultado con `insightSchema` (`lib/insights/schema.ts`) e inserta.
4. Tras insertar, la ruta llama a `revalidatePath('/')`, `'/bugs'` y `'/api/bugs'`. Los errores se registran con `console.error` y la respuesta es genérica.

Para probarlo a mano: `curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/new-insight`. En Vercel también se lanza desde *Settings → Cron Jobs*.

Si cambias campos del bug, actualiza a la vez `agentOutputSchema` e `insightSchema`, las instrucciones del agente, `prisma/schema.prisma` y `types/bug.ts`.

### Lectura / UI

- Toda la lectura pasa por `lib/data.ts` (`getAllInsights`, `getLatestInsights`). Con `DATA_SOURCE=mock` devuelve los 12 bugs de `lib/mocks/insights.ts` (fechas calculadas hacia atrás desde hoy) sin importar Prisma, así que funciona sin `DATABASE_URL`. El interruptor solo afecta a la lectura; la generación siempre usa la BD y OpenAI. En modo mock, la UI indica que son datos de ejemplo.
- `app/page.tsx`, `app/bugs/page.tsx` y `app/api/bugs` son estáticas con `revalidate = 3600`. El cron las invalida al publicar. `/bugs` pasa los datos a `components/shelf/Shelf.tsx` (cliente), que filtra y abre cajas; `/bugs#bug-N` abre esa caja al cargar.
- `next.config.ts` añade cabeceras de seguridad y desactiva `X-Powered-By`.

### Diseño

- Sin shadcn ni Tailwind: estilos con CSS Modules junto a cada componente y tokens globales (colores, fuentes, módulo `--u` de 8 px) en `app/globals.css`, que incluye un reset mínimo. Fuentes vía `next/font` (Bungee, Barlow, Barlow Condensed). Iconos con `lucide-react`.
- Mundo visual «estantería de videoclub»: el sistema está en `DESIGN.md`, el contexto de producto en `PRODUCT.md` y el contrato de la superficie en `.impeccable/surfaces/`. Respeta ese sistema al tocar la UI.

### Base de datos

- Prisma 7 con el generador `prisma-client` y salida en `prisma/generated` (ignorado por git): importar desde `@/prisma/generated/client`, nunca desde `@prisma/client`. Usa siempre `getPrisma()` de `lib/db.ts`, que es un singleton perezoso.
- Conexión con el driver adapter `@prisma/adapter-pg`. La URL se configura en `prisma.config.ts` / `lib/db.ts`, no en el `datasource` del schema.
- Las tablas viven en el esquema de Postgres `daily_insight` (`@@schema("daily_insight")`).

### Dependencias

- `pnpm-workspace.yaml` fuerza versiones parcheadas de dependencias transitivas de herramientas (`overrides`). Revísalo si Prisma o Next las actualizan por su cuenta. Dependabot (`.github/dependabot.yml`) abre PR semanales.
