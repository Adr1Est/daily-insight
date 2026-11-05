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
pnpm lint             # ESLint (eslint-config-next + eslint-config-prettier)
pnpm format           # Prettier: formatea todo (ver .prettierrc.json; los .md y .impeccable/ quedan fuera)
pnpm format:check     # Prettier: solo comprueba (para CI)
pnpm test             # Vitest (tests *.test.ts junto al código en lib/)
pnpm test -- lib/auth.test.ts   # un solo fichero
pnpm db:migrate       # prisma migrate deploy, a mano al desplegar cambios de esquema
```

CI (`.github/workflows/ci.yml`, en PR y push a `main`, Node 24 + pnpm 11): `install --frozen-lockfile`, lint, `tsc`, `format:check`, tests y build en modo mock (sin BD ni secretos). `pnpm audit --prod` solo avisa.

Nuevas migraciones: `pnpm dlx prisma migrate dev --name <nombre>` (usa `DIRECT_URL` como shadow DB, ver `prisma.config.ts`).

Desarrollar la UI sin base de datos: `DATA_SOURCE=mock pnpm dev` (en PowerShell, `$env:DATA_SOURCE="mock"; pnpm dev`).

## Variables de entorno (`.env` y Vercel)

Se validan en `lib/env.ts` (bajo demanda, no al importar).

- `DATA_SOURCE`: `mock` | `api` (por defecto `api`). Ver «Lectura / UI».
- `DATABASE_URL` y `DIRECT_URL`: Postgres. `DIRECT_URL` solo la usa Prisma para migraciones.
- `OPENAI_API_KEY`: la lee el SDK de agentes.
- `INTERNAL_TOKEN`: secreto del cron, de 32 caracteres o más. Va en Vercel y, con el mismo valor, como secreto del repositorio en GitHub; el workflow lo envía como `Authorization: Bearer …`. Si falta o es corto, el cron responde siempre 401.

## Estructura

- `app/`: solo rutas (páginas, `loading`, `error`, `api/`).
- `components/`: UI. `box/BoxCover` es la caja (lomo + contraportada, compartida por la portada y el archivo); `shelf/` contiene los lomos, la estantería y los estados vacíos; `top/` la lista de éxitos de `/top`; `settings/` la página `/ajustes`; `site/` la cabecera y el pie, montados en `app/layout.tsx`.
- `lib/`: lógica de servidor. `env`, `db` (cliente Prisma), `auth`, `data` (lectura), `insights/` (generación) y `mocks/`.
- `types/bug.ts`: el tipo `BugType`.
- Los módulos de servidor importan `server-only`. En Vitest se sustituye por `test/server-only.ts` (alias en `vitest.config.mts`).
- Alias de rutas: `@/*` apunta a la raíz del repo.

## Arquitectura

### Generación diaria

1. El workflow `.github/workflows/new-insight.yml` (cron `17 0 * * *` y `workflow_dispatch`) llama con `curl` a `GET ${API_URL}/api/cron/new-insight`, con reintentos. Necesita los secretos del repositorio `API_URL` (URL base de producción) e `INTERNAL_TOKEN` (mismo valor que en Vercel). No hay cron en Vercel.
2. La ruta valida el token con `verifyBearer` (`lib/auth.ts`, en tiempo constante y cerrada por defecto) y llama a `generateDailyInsight()` (`lib/insights/generate.ts`).
3. `generateDailyInsight`:
   1. Calcula la fecha de publicación en el servidor (`lib/insights/date.ts`, hora de Madrid, mes en español con mayúscula inicial).
   2. Si ya existe un bug con esa fecha, devuelve `skipped`, así que es idempotente.
   3. Lee los últimos 30 bugs de la BD para el prompt.
   4. Ejecuta `insightAgent` (`@openai/agents`, modelo `AI_MODEL` de `lib/insights/model.ts` (fuente única del nombre; no lo copies en documentos), con razonamiento `low` y `outputType: agentOutputSchema`). El system prompt es `INSTRUCTIONS`. El prompt de usuario (`buildPrompt`) incluye todos los títulos ya publicados (todo el historial, no solo los últimos) y un enfoque del día al azar (`FOCUSES`). Si el modelo propone un título ya usado (comparado con `normalizeTitle`), se le vuelve a pedir indicándole cuál evitar, hasta `MAX_ATTEMPTS` (3) intentos en total; si el último también se repite, se publica igualmente para no dejar el día sin bug.
   5. Valida el resultado con `insightSchema` (`lib/insights/schema.ts`) e inserta.
4. Tras insertar, la ruta llama a `revalidatePath('/')`, `'/bugs'` y `'/api/bugs'`. Los errores se registran con `console.error` y la respuesta es genérica.

Para probarlo a mano: `curl -H "Authorization: Bearer $INTERNAL_TOKEN" localhost:3000/api/cron/new-insight`. Con `?dryRun=1` genera y valida sin guardar nada (útil para revisar el prompt); lee la BD para el contexto. En producción se lanza a mano desde *Actions → Bug del día → Run workflow* (con la casilla `dryRun` opcional).

Si cambias campos del bug, actualiza a la vez `agentOutputSchema` e `insightSchema`, las instrucciones del agente, `prisma/schema.prisma` y `types/bug.ts`. `score` es la excepción: no lo genera la IA, lo mantienen los votos.

### Lectura / UI

- Toda la lectura pasa por `lib/data.ts`: `getInsightsPage` (archivo paginado), `getInsightById`, `getLatestInsights` (portada) y `getTopInsights` (`/top`: los `TOP_SIZE` = 50 con más puntuación, solo positiva; a igual puntuación, el más reciente). Nunca se cargan todos los bugs de golpe. Con `DATA_SOURCE=mock` devuelve los 12 bugs de `lib/mocks/insights.ts` (fechas calculadas hacia atrás desde hoy) sin importar Prisma, así que funciona sin `DATABASE_URL`. El interruptor solo afecta a la lectura; la generación siempre usa la BD y OpenAI. En modo mock, la UI indica que son datos de ejemplo.
- **Paginación** (`lib/pagination.ts`): por cursor sobre el `id` (los `limit` bugs con id menor que `cursor`, del más reciente al más antiguo); `PAGE_SIZE` = 15, máximo 50. La búsqueda (juego, plataforma o texto sin distinguir mayúsculas, o año exacto) se hace en la BD y también se pagina.
- `GET /api/bugs?limit&cursor&q` devuelve `{ items, nextCursor, total, matching }`: `total` es el número de bugs en la BD y `matching` los que cumplen la búsqueda. `GET /api/bugs/:id` devuelve un bug. Ambas son dinámicas y se cachean en la CDN por URL (`Cache-Control: s-maxage`). Parámetros inválidos → 400.
- **Votos** (`lib/votes.ts`, `lib/voter.ts`, `components/box/VoteControl.tsx`): cada caja lleva 👍 / 👎 y una sola puntuación (me gusta − no me gusta). El votante es anónimo: cookie httpOnly `daily-bug-voter` con un UUID, creada en el primer voto; un voto por bug y navegador, que se puede cambiar o quitar. `GET /api/bugs/:id/vote` → `{ score, myVote }` y `POST` con `{ value: 1 | -1 | 0 }` (0 quita el voto); ambas con `Cache-Control: private, no-store`. El POST exige `Origin` de la propia web (`isSameOrigin` en `lib/auth.ts`) → 403 si no. Las páginas estáticas traen `score` como valor inicial (hasta una hora por detrás) y el cliente lo refresca al montar. En modo mock los votos viven en memoria del proceso.
- `app/page.tsx` y `app/bugs/page.tsx` son estáticas con `revalidate = 3600`; el cron las invalida al publicar. `/bugs` renderiza solo la primera página; `components/shelf/Shelf.tsx` (cliente) pide el resto con «Cargar más» y busca con 300 ms de espera, cancelando peticiones obsoletas. `/bugs#bug-N` abre esa caja aunque no esté cargada (la pide a `/api/bugs/:id`). `app/top/page.tsx` es estática con `revalidate = 300`: los votos no la invalidan, así que puede ir hasta 5 minutos por detrás; cada fila enlaza a `/bugs#bug-N`.
- `next.config.ts` añade cabeceras de seguridad y desactiva `X-Powered-By`.
- `app/layout.tsx` monta `<Analytics />` de `@vercel/analytics` (Vercel Web Analytics). Solo envía datos desplegado en Vercel con Analytics activado en el panel; en local no registra nada.

### Diseño

- Sin shadcn ni Tailwind: estilos con CSS Modules junto a cada componente y tokens globales (colores, fuentes, módulo `--u` de 8 px) en `app/globals.css`, que incluye un reset mínimo. Fuentes vía `next/font` (Bungee, Barlow, Barlow Condensed). Iconos con `lucide-react`.
- Mundo visual «estantería de videoclub»: el sistema está en `DESIGN.md`, el contexto de producto en `PRODUCT.md` y el contrato de la superficie en `.impeccable/surfaces/`. Respeta ese sistema al tocar la UI.

### Temas

- `lib/themes.ts` es la fuente única de los temas: Videoclub (por defecto), Neón, Verde LCD y Vaporwave todo el año; Halloween del 1 de octubre al 1 de noviembre; Navidad del 1 de noviembre al 9 de enero. Para añadir un tema, añade una entrada a `THEMES` con los 15 roles de `ThemeTokens` (y `season` si es de temporada). Los tests de contraste lo comprueban solos.
- `app/layout.tsx` inserta `themeCss()` (un bloque `:root[data-theme]` por tema) y `themeInitScript()` en `<head>`. El script fija `data-theme` antes del primer pintado y por eso `<html>` lleva `suppressHydrationWarning`. Ese script incrusta `themeEngine.toString()`, así que `themeEngine` no puede usar nada definido fuera de su cuerpo.
- `components/site/ThemePicker.tsx` es el selector de la cabecera (`popover` nativo). Comparte con `/ajustes` el estado del tema a través de `components/site/themeClient.tsx` (`useCurrentTheme`, `applyTheme`, `Swatch`), que lee `data-theme` de `<html>`. Guarda en `localStorage` las claves `daily-bug:theme` y `daily-bug:seasons-seen`. Un tema de temporada se aplica solo la primera vez dentro de su temporada, salvo que `daily-bug:seasonal` valga `"off"` (ajustes): entonces `resolve` recibe `seasonal: false` y las temporadas solo se aplican si el visitante las elige.
- En CSS usa solo los roles (`var(--card-ink)`, `var(--sticker)`…), nunca colores literales.

### Ajustes (`/ajustes`)

- Página estática; el contenido son componentes de cliente (`components/settings/`). Se abre con la rueda dentada (`Settings` de lucide) de la cabecera, junto al selector de tema. Sin librerías de estado: todo vive en `<html>` (`data-theme`, `data-motion`, `data-text-size`) y en `localStorage`, y se lee con `useSyncExternalStore`.
- `lib/prefs.ts`: claves `daily-bug:motion` (`auto|on|off`) y `daily-bug:text-size` (`normal|large|xl`), y `prefsInitScript()`, que `app/layout.tsx` inserta en `<head>` tras el del tema para aplicarlas antes del primer pintado. El CSS de `app/globals.css` las lee: `data-motion` controla `.sign-float` y `data-text-size` fija `--text-scale`, que multiplica el tamaño del texto del bug.
- «Mis votos»: `GET /api/votes` → `{ votes }` (los de esta cookie) y `DELETE /api/votes` → `{ deleted }`, que borra los votos, los descuenta de `Insight.score` en una transacción (`forgetVoter`) y borra la cookie. El DELETE exige el mismo origen. «Restablecer» borra las preferencias y el tema, pero conserva `daily-bug:seasons-seen` y los votos.

### Base de datos

- Prisma 7 con el generador `prisma-client` y salida en `prisma/generated` (ignorado por git): importar desde `@/prisma/generated/client`, nunca desde `@prisma/client`. Usa siempre `getPrisma()` de `lib/db.ts`, que es un singleton perezoso.
- Conexión con el driver adapter `@prisma/adapter-pg`. La URL se configura en `prisma.config.ts` / `lib/db.ts`, no en el `datasource` del schema.
- Las tablas viven en el esquema de Postgres `daily_insight` (`@@schema("daily_insight")`).
- `Vote` (clave `insightId` + `voterId`, `value` 1 o −1 con `CHECK`) es la fuente de verdad de los votos; `Insight.score` es su suma desnormalizada. `castVote` actualiza ambos en una transacción que bloquea la fila del bug (`FOR UPDATE`). Si tocas una, toca la otra.

### Dependencias

- `pnpm-workspace.yaml` fuerza versiones parcheadas de dependencias transitivas de herramientas (`overrides`). Revísalo si Prisma o Next las actualizan por su cuenta. Dependabot (`.github/dependabot.yml`) abre PR semanales.
