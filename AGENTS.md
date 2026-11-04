# AGENTS.md

Guía para agentes de código que trabajen en este repositorio.

## Qué es

Daily Insight: app Next.js (App Router, React 19, Tailwind v4) que cada día genera con IA una curiosidad sobre un bug/glitch histórico de videojuegos, la guarda en PostgreSQL (Supabase) y la muestra en una UI estilo terminal. Todo el contenido de la UI y los prompts está en español.

## Comandos

Gestor de paquetes: **pnpm**.

```bash
pnpm install          # ojo: postinstall ejecuta `prisma migrate deploy && prisma generate` (requiere DATABASE_URL válida)
pnpm dlx prisma generate
pnpm dev              # servidor de desarrollo
pnpm build
pnpm lint             # ESLint (eslint-config-next)
```

No hay tests configurados.

Migraciones: `pnpm dlx prisma migrate dev --name <nombre>` (usa `DIRECT_URL` como shadow DB, ver `prisma.config.ts`).

## Variables de entorno (`.env`)

`OPENAI_API_KEY`, `DATABASE_URL`, `DIRECT_URL`, `API_URL` (URL base de la propia app desplegada), `INTERNAL_TOKEN`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (el cliente de Supabase no se usa en el código actualmente; el acceso a BD es solo vía Prisma).

## Arquitectura

### Flujo de generación diaria

1. `.github/workflows/daily-insight.yml` (cron `0 0 * * *` + manual) ejecuta `scripts/insertInsight.js`, que llama a `GET {API_URL}/api/newInsight`.
2. `app/api/newInsight` → llama por HTTP a `{API_URL}/api/askAgent`.
3. `app/api/askAgent` → `createPrompt()` (en `app/utils/agent/index.ts`) llama por HTTP a `{API_URL}/api/getContext`, que devuelve los últimos 30 insights para que el modelo no repita juegos/datos. Luego ejecuta `insightAgent` (`@openai/agents`, modelo `gpt-5-nano`).
4. El agente devuelve un JSON en texto (`day`, `month`, `year`, `bugYear`, `game`, `platform`, `data`); `newInsight` hace `JSON.parse` del `finalOutput`, convierte los numéricos con `Number()` y lo inserta con Prisma.

Puntos importantes:
- Las rutas se llaman entre sí por HTTP usando `API_URL`, no por importación directa. En local, `API_URL` debe apuntar al servidor en marcha (p. ej. `http://localhost:3000`).
- `newInsight`, `askAgent` y `getContext` exigen `Authorization: Bearer ${INTERNAL_TOKEN}`. `getBugs` es pública.
- El formato de salida depende solo de las instrucciones del agente (no hay `outputType`/zod). Si cambias campos, actualiza a la vez las instrucciones del agente, el parseo en `newInsight`, `prisma/schema.prisma` y `app/types/bug.types.ts`.

### Lectura / UI

- `app/page.tsx` (`force-dynamic`) renderiza `CustomTerminal`, un Server Component que consulta Prisma directamente para el último insight.
- `app/bugs/page.tsx` es un Client Component que hace fetch a `/api/getBugs` y filtra en cliente.
- Componentes en `app/ui/` (no en `components/`); `app/ui/shadcn-io/terminal` es un componente de terminal animado (motion) de shadcn.io.

### Base de datos

- Prisma 7 con el generador `prisma-client` y salida en `prisma/generated` (ignorado por git): importar desde `@/prisma/generated/client`, no desde `@prisma/client`.
- Conexión con el driver adapter `@prisma/adapter-pg`; la URL se configura en `prisma.config.ts` / `lib/prisma.ts`, no en el `datasource` del schema.
- Las tablas viven en el esquema de Postgres `daily_insight` (`@@schema("daily_insight")`).
- Alias de rutas: `@/*` → raíz del repo.
