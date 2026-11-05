# AGENTS.md

Guía para agentes de código que trabajen en este repositorio.

## Qué es

Daily Bug (repo `daily-insight`): app Next.js (App Router, React 19, CSS Modules) desplegada en Vercel. Cada día genera con IA una curiosidad de la historia de los videojuegos (bug, secreto, desarrollo, contenido descartado o localización), la guarda en PostgreSQL y la muestra como la contraportada de una caja de videoclub. Todo el contenido de la UI y los prompts está en español.

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
- `components/`: UI. `box/BoxCover` es la caja (lomo + contraportada, compartida por la portada y el archivo); `shelf/` contiene los lomos, la estantería y los estados vacíos; `top/` la lista de éxitos de `/top`; `settings/` la página `/ajustes`; `site/` la cabecera, el pie y el marquee, montados en `app/layout.tsx`. En móvil y tablet (hasta 1024 px) la cabecera no se ve: un botón flotante abre un panel lateral `<dialog>` con el logotipo, los enlaces, el tema y los ajustes; el marquee se mantiene arriba.
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
   3. Lee el historial (juego, tipo y texto) de la BD para el prompt.
   4. Mira si hoy hay una entrada en el calendario de lanzamientos (`RELEASES` de `lib/insights/calendar.ts`; `"MM-DD"` = aniversario cada año, `"AAAA-MM-DD"` = una sola vez, fecha de Madrid). Si la hay, el prompt es `buildEventPrompt`: la curiosidad trata de ese juego, el modelo elige el tipo y recibe lo ya publicado del juego para no repetirlo; si el juego sale ese mismo año, solo puede hablar de su desarrollo anunciado o de su saga. Si no la hay, el servidor elige el tipo al azar (`pickKind`, los cinco por igual) y lo impone aunque el modelo devuelva otro.
   5. Ejecuta `insightAgent` (`@openai/agents`, modelo `AI_MODEL` de `lib/insights/model.ts` (fuente única del nombre; no lo copies en documentos), con razonamiento `low` y `outputType: agentOutputSchema`). El system prompt es `INSTRUCTIONS`. Los tipos y su guía para el modelo están en `lib/insights/kinds.ts` (`KINDS`, fuente única también para la UI y el `CHECK` de la BD). El prompt de usuario (`buildPrompt`) incluye el tipo del día, los títulos ya publicados **con ese tipo** (todo el historial) y un enfoque al azar (`FOCUSES`). Se evita repetir juego + tipo: un juego con un bug publicado puede volver como secreto. Si el modelo propone un par ya usado (título comparado con `normalizeTitle`), se le vuelve a pedir indicándole cuál evitar, hasta `MAX_ATTEMPTS` (3) intentos en total; si el último también se repite, se publica igualmente para no dejar el día sin bug.
   6. Valida el resultado con `insightSchema` (`lib/insights/schema.ts`) e inserta. Si el día tenía entrada en el calendario, copia en el bug `releaseGame`, `releasePlatform` y `releaseYear` (no los genera la IA), para que la chapa del archivo no cambie si luego se edita el calendario.
4. Tras insertar, la ruta llama a `revalidatePath('/')`, `'/bugs'`, `'/top'` y `'/api/bugs'`. Los errores se registran con `console.error` y la respuesta es genérica.

Para probarlo a mano: `curl -H "Authorization: Bearer $INTERNAL_TOKEN" localhost:3000/api/cron/new-insight`. Con `?dryRun=1` genera y valida sin guardar nada (útil para revisar el prompt); lee la BD para el contexto y devuelve también la entrada del calendario, si la hay. Con `dryRun`, `&kind=secreto` (o cualquier otro tipo) fuerza el tipo; sin `dryRun`, `kind` da 400. En producción se lanza a mano desde *Actions → Bug del día → Run workflow* (con la casilla `dryRun` opcional).

Si cambias campos del bug, actualiza a la vez `agentOutputSchema` e `insightSchema`, las instrucciones del agente, `prisma/schema.prisma` y `types/bug.ts`. Si añades o renombras un tipo, cambia `KINDS` y escribe una migración para el `CHECK` de `Insight.kind`. `bugYear` es el año del hecho (el nombre viene de cuando solo había bugs). `score` y los campos `release*` son la excepción: no los genera la IA (`score` lo mantienen los votos y `release*` los copia el servidor del calendario).

### Lectura / UI

- Toda la lectura pasa por `lib/data.ts`: `getInsightsPage` (archivo paginado), `getInsightById`, `getLatestInsights` (portada) y `getTopInsights` (`/top`: los `TOP_SIZE` = 50 bugs con algún voto, de más a menos puntuación (también negativos); a igual puntuación, el más reciente). Nunca se cargan todos los bugs de golpe. Con `DATA_SOURCE=mock` devuelve los 12 bugs de `lib/mocks/insights.ts` (fechas calculadas hacia atrás desde hoy) sin importar Prisma, así que funciona sin `DATABASE_URL`. El interruptor solo afecta a la lectura; la generación siempre usa la BD y OpenAI. En modo mock, la UI indica que son datos de ejemplo.
- **Paginación** (`lib/pagination.ts`): por cursor sobre el `id` (los `limit` bugs con id menor que `cursor`, del más reciente al más antiguo); `PAGE_SIZE` = 15, máximo 50. La búsqueda (juego, plataforma o texto sin distinguir mayúsculas, o año exacto) se hace en la BD y también se pagina.
- `GET /api/bugs?limit&cursor&q&kind` devuelve `{ items, nextCursor, total, matching }`: `total` es el número de bugs en la BD y `matching` los que cumplen la búsqueda y el filtro. `kind` filtra por tipo (un tipo desconocido da 400); la búsqueda de texto también encuentra por el nombre del tipo. `GET /api/bugs/:id` devuelve un bug. Ambas son dinámicas y se cachean en la CDN por URL (`Cache-Control: s-maxage`). Parámetros inválidos → 400.
- **Votos** (`lib/votes.ts`, `lib/voter.ts`, `components/box/VoteControl.tsx`): cada caja lleva 👍 / 👎 y una sola puntuación (me gusta − no me gusta). El votante es anónimo: cookie httpOnly `daily-bug-voter` con un UUID, creada en el primer voto; un voto por bug y navegador, que se puede cambiar o quitar. `GET /api/bugs/:id/vote` → `{ score, myVote }` y `POST` con `{ value: 1 | -1 | 0 }` (0 quita el voto); ambas con `Cache-Control: private, no-store`. El POST exige `Origin` de la propia web (`isSameOrigin` en `lib/auth.ts`) → 403 si no. Las páginas estáticas traen `score` como valor inicial (hasta una hora por detrás) y el cliente lo refresca al montar. En modo mock los votos viven en memoria del proceso.
- `app/page.tsx` y `app/bugs/page.tsx` son estáticas con `revalidate = 3600`; el cron las invalida al publicar. `/bugs` renderiza solo la primera página; `components/shelf/Shelf.tsx` (cliente) pide el resto con «Cargar más» y busca con 300 ms de espera, cancelando peticiones obsoletas, y filtra por tipo al instante con las etiquetas «Tipo» (se combina con la búsqueda). `/bugs#bug-N` abre esa caja aunque no esté cargada (la pide a `/api/bugs/:id`). `app/top/page.tsx` es estática con `revalidate = 300`: los votos no la invalidan, así que puede ir hasta 5 minutos por detrás; cada fila enlaza a `/bugs#bug-N`.
- **Lanzamientos en la UI:** `BoxCover` muestra la chapa «Día de estreno» o «Aniversario · N años» cuando el bug tiene `releaseGame` (estreno si `releaseYear` coincide con el año de publicación, ver `releaseOccasion`). `components/site/ReleaseMarquee.tsx`, montado en `app/layout.tsx` sobre la cabecera, anuncia el próximo lanzamiento del calendario (`nextReleases`: el siguiente día con fechas completas después de hoy, con todos sus juegos). Se calcula en el navegador porque las páginas son estáticas; sin lanzamientos futuros no se pinta.
- `next.config.ts` añade cabeceras de seguridad y desactiva `X-Powered-By`.
- `app/layout.tsx` monta `<Analytics />` de `@vercel/analytics` (Vercel Web Analytics). Solo envía datos desplegado en Vercel con Analytics activado en el panel; en local no registra nada.

### Diseño

- Sin shadcn ni Tailwind: estilos con CSS Modules junto a cada componente y tokens globales (colores, fuentes, módulo `--u` de 8 px) en `app/globals.css`, que incluye un reset mínimo. Fuentes vía `next/font` (Bungee, Barlow, Barlow Condensed). Iconos con `lucide-react`.
- Mundo visual «estantería de videoclub»: el sistema está en `DESIGN.md`, el contexto de producto en `PRODUCT.md` y el contrato de la superficie en `.impeccable/surfaces/`. Respeta ese sistema al tocar la UI.

### Temas

- `lib/themes.ts` es la fuente única de los temas: Videoclub (por defecto), Oscuro, Neón, Verde LCD, Vaporwave y Blanco y negro todo el año; Halloween del 1 de octubre al 1 de noviembre; Navidad del 1 de noviembre al 9 de enero. Para añadir un tema, añade una entrada a `THEMES` con los 15 roles de `ThemeTokens` (y `season` si es de temporada). Los tests de contraste lo comprueban solos.
- `app/layout.tsx` inserta `themeCss()` (un bloque `:root[data-theme]` por tema) y `themeInitScript()` en `<head>`. El script fija `data-theme` antes del primer pintado y por eso `<html>` lleva `suppressHydrationWarning`. Ese script incrusta `themeEngine.toString()`, así que `themeEngine` no puede usar nada definido fuera de su cuerpo.
- `components/site/ThemePicker.tsx` es el selector de la cabecera (`popover` nativo). Comparte con `/ajustes` el estado del tema a través de `components/site/themeClient.tsx` (`useCurrentTheme`, `applyTheme`, `Swatch`), que lee `data-theme` de `<html>`. Guarda en `localStorage` las claves `daily-bug:theme` y `daily-bug:seasons-seen`. Un tema de temporada se aplica solo la primera vez dentro de su temporada, salvo que `daily-bug:seasonal` valga `"off"` (ajustes): entonces `resolve` recibe `seasonal: false` y las temporadas solo se aplican si el visitante las elige.
- En CSS usa solo los roles (`var(--card-ink)`, `var(--sticker)`…), nunca colores literales.

### Ajustes (`/ajustes`)

- Página estática; el contenido son componentes de cliente (`components/settings/`). Se abre con la rueda dentada (`Settings` de lucide) de la cabecera, junto al selector de tema. Sin librerías de estado: todo vive en `<html>` (`data-theme`, `data-motion`, `data-text-size`) y en `localStorage`, y se lee con `useSyncExternalStore`.
- `lib/prefs.ts`: claves `daily-bug:motion` (`auto|on|off`) y `daily-bug:text-size` (`normal|large|xl`), y `prefsInitScript()`, que `app/layout.tsx` inserta en `<head>` tras el del tema para aplicarlas antes del primer pintado. El CSS de `app/globals.css` las lee: `data-motion` controla `.sign-float` y `data-text-size` fija `--text-scale`, que multiplica el tamaño del texto del bug.
- «Mis votos»: `GET /api/votes` → `{ votes }` (los de esta cookie) y `DELETE /api/votes` → `{ deleted }`, que borra los votos, los descuenta de `Insight.score` en una transacción (`forgetVoter`) y borra la cookie. El DELETE exige el mismo origen. «Restablecer» borra las preferencias y el tema, pero conserva `daily-bug:seasons-seen` y los votos.

### PWA

- Instalable y con uso sin conexión, sin dependencias. Nombre, descripción y colores (`spine` y `wall` del tema por defecto) salen de `lib/pwa.ts`, que usan `app/manifest.ts` (`/manifest.webmanifest`) y `metadata`/`viewport` de `app/layout.tsx`.
- Iconos: el kit de `app/` (`favicon.ico`, `icon.svg`, `apple-icon.png`). Los PNG del manifest (`/pwa-icon/192`, `/512` y `/maskable`, este con el dibujo al 70 % para la zona segura) los genera `app/pwa-icon/[variant]/route.tsx` en el build a partir de `app/icon.svg`: si cambias el SVG, cambian solos.
- `<meta name="theme-color">` lleva el `spine` del tema activo (la cabecera): lo pone `themeInitScript()` antes de pintar y lo mantiene `components/site/ThemeColorMeta.tsx` al cambiar de tema o de página.
- Service worker: `public/sw.js`, escrito a mano. Lo registra `components/site/ServiceWorker.tsx` **solo en producción** (para probarlo: `pnpm build && pnpm start`). Páginas: red primero, con la última copia y, sin ella, `/offline` (`app/offline/page.tsx`, tarjeta de estado «Sin señal en el videoclub») como respaldo. `/_next/static/*`: caché primero. `GET /api/bugs` sin `q` ni `cursor` y `/api/bugs/:id`: red primero con copia. El resto de `/api` (votos, `/api/votes`, cron, búsquedas) no se guarda nunca, ni abierto en el navegador, y tampoco nada con `Cache-Control: no-store` o `private`. Cada caché tiene un máximo de entradas (`LIMITS`). Al instalarse precachea `/offline` y los recursos estáticos que enlaza.
- «Instalar app» en el panel lateral, encima de tema y ajustes (`components/site/InstallApp.tsx`, montado en `SiteHeader`): `installPromptScript()` (`lib/pwa.ts`, en `<head>`) guarda `beforeinstallprompt` en `window.__dbInstall` porque Chrome puede lanzarlo antes de hidratar, y el botón llama a `prompt()`. En iOS, que no tiene ese evento, el botón muestra cómo añadirla desde Compartir. No se pinta en escritorio (sin `pointer: coarse`), si ya está instalada (`display-mode: standalone`) o si el navegador no lo permite.
- Si cambias `sw.js` o lo que precachea, sube `CACHE_VERSION`: al activarse borra las cachés `daily-bug-*` de otras versiones. `next.config.ts` sirve `/sw.js` con `no-cache` para que el navegador detecte siempre la versión nueva.

### Base de datos

- Prisma 7 con el generador `prisma-client` y salida en `prisma/generated` (ignorado por git): importar desde `@/prisma/generated/client`, nunca desde `@prisma/client`. Usa siempre `getPrisma()` de `lib/db.ts`, que es un singleton perezoso.
- Conexión con el driver adapter `@prisma/adapter-pg`. La URL se configura en `prisma.config.ts` / `lib/db.ts`, no en el `datasource` del schema.
- Las tablas viven en el esquema de Postgres `daily_insight` (`@@schema("daily_insight")`).
- `Vote` (clave `insightId` + `voterId`, `value` 1 o −1 con `CHECK`) es la fuente de verdad de los votos; `Insight.score` es su suma desnormalizada. `castVote` actualiza ambos en una transacción que bloquea la fila del bug (`FOR UPDATE`). Si tocas una, toca la otra.

### Dependencias

- `pnpm-workspace.yaml` fuerza versiones parcheadas de dependencias transitivas de herramientas (`overrides`). Revísalo si Prisma o Next las actualizan por su cuenta. Dependabot (`.github/dependabot.yml`) abre PR semanales.
