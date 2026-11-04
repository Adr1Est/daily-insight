# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Gamers curiosos: aficionados a los videojuegos que entran a leer la curiosidad del día sobre un bug, glitch o fallo histórico, y pueden volver a diario o explorar los anteriores.

## Product Purpose

Daily Bug publica cada día, generada con IA (gpt-5-nano), una curiosidad sobre un bug/glitch/fallo conocido de la historia de los videojuegos, y guarda el archivo completo para consultarlo. El éxito es que el visitante lea el bug del día y le apetezca volver o bucear en el archivo.

## Positioning

Una única dosis diaria, breve (máx. ~10 líneas), centrada exclusivamente en bugs y glitches de videojuegos, con un archivo acumulado que crece cada día.

## Operating Context

- Un cron diario (GitHub Actions, 00:00 UTC) genera e inserta el insight; la portada siempre muestra el último.
- Cada insight tiene: fecha (día, mes en español, año), videojuego, plataforma, año del bug y texto descriptivo.
- `/bugs` lista todos los insights con buscador por juego, texto, plataforma o año.

## Capabilities and Constraints

- Funciones actuales a conservar tal cual: portada con el bug del día y listado `/bugs` con buscador. La estructura cambiará más adelante; no añadir funciones nuevas por ahora.
- Todo el contenido y la UI en español.
- Stack existente: Next.js App Router, React 19, CSS Modules (sin Tailwind), Prisma/Postgres. Iconos con lucide-react.
- `DATA_SOURCE=mock` sirve la lectura (portada, archivo, `/api/getBugs`) desde mocks locales; la generación diaria siempre usa la BD.
- El texto lo genera un modelo: longitud variable, y el campo `game` puede valer "no es un juego".
- Sin shadcn: no usar sus componentes, configuración, tokens, `cn()`/clsx/tailwind-merge ni tw-animate-css.

## Brand Commitments

- Nombre visible: **Daily Bug**.
- Autoría visible: Adrián Estévez, con enlaces a GitHub, LinkedIn y web personal; crédito "Powered by gpt-5-nano".

## Evidence on Hand

- Contenido real: los insights almacenados en la base de datos.
- No hay logotipo, ilustraciones ni testimonios; no inventarlos.

## Product Principles

1. El bug del día es el protagonista; todo lo demás es secundario.
2. Lectura rápida: se entiende en un vistazo y se lee en menos de un minuto.
3. El archivo es para curiosear, no para trabajar: encontrar un bug concreto debe ser fácil.
4. Honestidad sobre el origen: el contenido lo genera una IA y así se indica.
