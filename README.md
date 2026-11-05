# Daily Bug

Cada día, un bug, glitch o fallo técnico real de la historia de los videojuegos, escrito por IA y presentado como la contraportada de una caja de videoclub. Los bugs anteriores se guardan en «La estantería», un archivo con buscador.

Una tarea programada genera el bug del día con la API de OpenAI y lo guarda en PostgreSQL. La web lo muestra en la portada y lo añade al archivo.

## Funcionalidades

- **Bug del día:** juego o producto, plataforma, año del fallo y una explicación breve en español.
- **La estantería:** archivo paginado (15 por carga) con búsqueda por juego, plataforma, texto o año. Cada lomo se abre en su contraportada.
- **Temas:** Videoclub, Neón y Verde LCD todo el año; Halloween (del 1 de octubre al 1 de noviembre) y Navidad (del 1 de noviembre al 9 de enero) por temporada. La elección se guarda en el navegador.
- **Generación fiable:** la salida del modelo se valida antes de guardarse, la fecha la pone el servidor y hay como mucho un bug por día.
- **Modo mock:** se puede desarrollar la interfaz sin base de datos ni clave de OpenAI.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · CSS Modules · Prisma 7 + PostgreSQL · OpenAI Agents SDK · Vitest · Vercel

## Requisitos

- Node.js 24
- pnpm 11
- Para datos reales: una base de datos PostgreSQL y una clave de la API de OpenAI

## Puesta en marcha

```bash
pnpm install
```

### Sin base de datos (modo mock)

La forma más rápida de ver la web: sirve 12 bugs de ejemplo y no necesita `.env`.

```bash
DATA_SOURCE=mock pnpm dev
```

En PowerShell: `$env:DATA_SOURCE="mock"; pnpm dev`. Después abre <http://localhost:3000>.

### Con base de datos

1. Crea un `.env` en la raíz con las variables de la tabla siguiente.
2. Aplica las migraciones: `pnpm db:migrate`.
3. Arranca: `pnpm dev`.

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Conexión a PostgreSQL. |
| `DIRECT_URL` | Conexión directa para las migraciones de Prisma. |
| `OPENAI_API_KEY` | Clave de la API de OpenAI para generar los bugs. |
| `INTERNAL_TOKEN` | Secreto aleatorio de 32 caracteres o más que protege la ruta de generación (p. ej. `openssl rand -hex 32`). |
| `DATA_SOURCE` | Opcional: `api` (por defecto) o `mock`. |

## Scripts

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo. |
| `pnpm build` | Genera el cliente de Prisma y compila. Las páginas se prerenderizan, así que necesita base de datos o `DATA_SOURCE=mock`. |
| `pnpm start` | Sirve la build de producción. |
| `pnpm lint` | ESLint. |
| `pnpm format` / `pnpm format:check` | Prettier: formatea o solo comprueba. |
| `pnpm test` | Tests con Vitest. |
| `pnpm db:migrate` | Aplica las migraciones pendientes. No se ejecuta al instalar ni al desplegar: lánzalo a mano tras cambiar el esquema. |

## Cómo se genera el bug del día

1. El workflow de GitHub Actions `.github/workflows/new-insight.yml` llama cada día hacia las 00:17 UTC a `GET /api/cron/new-insight` de la app desplegada con `Authorization: Bearer <INTERNAL_TOKEN>` (GitHub puede retrasar unos minutos las ejecuciones programadas).
2. El servidor pasa al modelo todos los títulos ya publicados y un enfoque elegido al azar (una época, un tipo de plataforma…) para variar.
3. La respuesta se valida y, si repite un juego ya publicado, se pide otro. Después se guarda con la fecha del servidor y se refrescan la portada y el archivo.

Para probar el prompt sin guardar nada:

```bash
curl -H "Authorization: Bearer $INTERNAL_TOKEN" "http://localhost:3000/api/cron/new-insight?dryRun=1"
```

`dryRun` no escribe en la base de datos, pero sí llama a OpenAI.

El modelo está definido en `lib/insights/model.ts`.

## API pública

| Ruta | Respuesta |
| --- | --- |
| `GET /api/bugs?limit=&cursor=&q=` | `{ items, nextCursor, total, matching }`. Paginación por cursor: 15 por defecto, máximo 50. `total` son todos los bugs y `matching` los que cumplen la búsqueda. |
| `GET /api/bugs/:id` | Un bug concreto, o 404 si no existe. |

Las respuestas se cachean en la CDN durante unos minutos.

## Estructura

```text
app/          Rutas: portada, /bugs, API y cron
components/   Interfaz: la caja (box), la estantería (shelf) y cabecera/pie (site)
lib/          Servidor: datos, paginación, autenticación, generación con IA y temas
types/        Tipos compartidos
prisma/       Esquema y migraciones
```

La guía técnica completa (arquitectura, convenciones y reglas) está en [AGENTS.md](AGENTS.md). El sistema visual está en [DESIGN.md](DESIGN.md) y el contexto de producto en [PRODUCT.md](PRODUCT.md).

## Despliegue (Vercel)

1. Configura en Vercel las variables `DATABASE_URL`, `DIRECT_URL`, `OPENAI_API_KEY` y `INTERNAL_TOKEN`. La build necesita `DATABASE_URL`.
2. Si hay migraciones nuevas, ejecuta `pnpm db:migrate` contra la base de datos de producción.
3. En GitHub (*Settings → Secrets and variables → Actions*), crea los secretos `INTERNAL_TOKEN` (el mismo valor que en Vercel) y `API_URL` con la URL de producción (p. ej. `https://daily-bug.vercel.app`). Puedes lanzarlo a mano desde *Actions → Bug del día → Run workflow*, con la opción `dryRun` si no quieres guardar.

GitHub desactiva los workflows programados tras 60 días sin actividad en el repositorio; si pasa, reactívalo desde la pestaña *Actions*.

## CI

Cada pull request y cada push a `main` ejecutan en GitHub Actions (`.github/workflows/ci.yml`): instalación con el lockfile, lint, tipos, formato, tests y build en modo mock. La auditoría de dependencias solo avisa, no bloquea. No hace falta ningún secreto.

---

Desarrollado por [Adrián Estévez](https://www.adrianestevezs.dev) · [GitHub](https://github.com/Adr1Est) · [LinkedIn](https://www.linkedin.com/in/adrianestevezsalamanca/)
