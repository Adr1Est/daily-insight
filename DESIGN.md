---
name: Daily Bug
description: Cada día, un bug histórico de videojuegos impreso en la contraportada de una caja PAL de videoclub.
colors:
  wall: "#1d1b19"
  wall-slat: "#252220"
  wall-ink: "#f2efe6"
  wall-ink-soft: "#bdb6a8"
  shelf: "#4a3422"
  shelf-edge: "#6b4a2e"
  card: "#f2efe6"
  card-ink: "#141414"
  card-ink-soft: "#4a463f"
  spine: "#141414"
  highlight: "#ffd23f"
  on-highlight: "#141414"
  sticker: "#d1281b"
  on-sticker: "#ffffff"
  band: "#2ec4d6"
typography:
  display:
    fontFamily: "Bungee, Arial Black, sans-serif"
    fontSize: "clamp(2rem, 1.2rem + 3.2vw, 4.25rem)"
    fontWeight: 400
    lineHeight: 1
  headline:
    fontFamily: "Bungee, Arial Black, sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 2.4vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1
  title:
    fontFamily: "Bungee, Arial Black, sans-serif"
    fontSize: "clamp(1.5rem, 1.2rem + 1.2vw, 2rem)"
    fontWeight: 400
    lineHeight: 1.1
  logo:
    fontFamily: "Bungee, Arial Black, sans-serif"
    fontSize: "clamp(1.75rem, 1.2rem + 2vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  button:
    fontFamily: "Bungee, Arial Black, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.1
  body-lead:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  data:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1.2
    fontFeature: "tnum"
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.08em"
  label-sm:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    letterSpacing: "0.12em"
  credit:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    letterSpacing: "0.06em"
  label-xs:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 800
    letterSpacing: "0.08em"
  spine-title:
    fontFamily: "Bungee, Arial Black, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1
  spine-title-long:
    fontFamily: "Bungee, Arial Black, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.1
rounded:
  none: "0px"
  sticker: "50%"
spacing:
  hair: "4px"
  u: "8px"
  u-2: "16px"
  u-3: "24px"
  u-4: "32px"
  u-6: "48px"
  gutter: "clamp(16px, 4vw, 48px)"
components:
  button-box:
    backgroundColor: "{colors.spine}"
    textColor: "{colors.highlight}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "16px 24px"
  button-box-hover:
    backgroundColor: "{colors.sticker}"
    textColor: "{colors.on-sticker}"
  nav-link:
    textColor: "{colors.wall-ink-soft}"
    typography: "{typography.label}"
    padding: "8px 0"
  nav-link-active:
    textColor: "{colors.wall-ink}"
  search-field:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 16px"
  back-cover:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-ink}"
    rounded: "{rounded.none}"
    padding: "56px clamp(24px, 5vw, 56px) 32px"
  facts-cell:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-ink}"
    typography: "{typography.data}"
    padding: "8px 20px"
  facts-cell-inverted:
    backgroundColor: "{colors.spine}"
    textColor: "{colors.highlight}"
  sticker-number:
    backgroundColor: "{colors.sticker}"
    textColor: "{colors.on-sticker}"
    rounded: "{rounded.sticker}"
    size: "184px"
  sticker-today:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.on-highlight}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  spine:
    backgroundColor: "{colors.spine}"
    textColor: "{colors.highlight}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    width: "64px"
    height: "296px"
  status-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-ink}"
    rounded: "{rounded.none}"
    padding: "32px"
---

# Design System: Daily Bug

## Overview

**Creative North Star: "La estantería del videoclub"**

Daily Bug es un videoclub de barrio a última hora: una pared de listones oscuros, una balda de madera y cajas PAL de canto. El bug del día es la contraportada de la caja más nueva; el archivo es la estantería de lomos. Todo lo que hay en pantalla es un objeto impreso (cartón, tinta, pegatinas, cinta) y se comporta como tal: esquinas rectas, sombras duras sin desenfoque y cambios de estado secos, sin transiciones.

La densidad es de caja real: un lomo negro con banda de color, una contraportada de cartón claro con el título enorme en Bungee, una ficha técnica de tres celdas con filete negro y el texto en una columna legible. Las pegatinas (redonda roja con el número, rectangular amarilla «¡Hoy!») van giradas y apiladas en orden de llegada. El sistema rechaza el «sitio retro» por defecto (fondo negro puro, fuente pixel, neón, brillos y scanlines); el neón solo existe como tema que el visitante elige.

**Key Characteristics:**
- Dos suelos: la pared oscura (`wall`) y el cartón claro (`card`); cada uno tiene su propia tinta.
- Tres tintas de impresión saturadas (en Videoclub: rojo, amarillo y cian) que solo aparecen como bandas, pegatinas, cintas y rotulación.
- Cinco temas intercambiables (ver Temas): los colores se nombran por rol, nunca por tono.
- Bungee como rotulación impresa, Barlow Condensed en mayúsculas para etiquetas, Barlow para leer.
- Módulo de 8 px (`--u`) en todo el espaciado.
- Sombras desplazadas sin desenfoque; ninguna esquina redondeada salvo la pegatina circular.
- Cambios de estado instantáneos: sin `transition` ni animación. Única excepción: el logotipo flota suavemente.

## Colors

Pared y madera oscuras y cálidas como escenario; cartón crema y tinta negra para lo que se lee; tres tintas planas de imprenta para marcar.

### Primary
- **Amarillo Rotulador** (`highlight`): la rotulación sobre negro: logotipo, títulos de lomo, texto de botón, celda invertida de la ficha, pegatina «¡Hoy!», selección de texto y anillo de foco. Es el color de la marca.

### Secondary
- **Rojo Pegatina** (`sticker`, texto `on-sticker`): la pegatina redonda del número de bug, la cinta «Fuera», el subrayado de navegación activa, el hover de los botones, el desregistro del logotipo y la banda de las tarjetas de estado. Siempre con `on-sticker` encima.

### Tertiary
- **Cian de Banda** (`band`): solo como banda superior de lomo y contraportada. Nunca para texto.

### Neutral
- **Pared de Listones** (wall) y **Listón** (wall-slat): fondo de página, en listones verticales alternos de 48 px.
- **Madera de Balda** (`shelf`) y **Canto de Balda** (`shelf-edge`): la balda bajo las cajas y las baldas del archivo; el canto también colorea la barra de scroll.
- **Lomo** (`spine`): lomos, botones, celda invertida de la ficha.
- **Tinta de Cartón** (`card-ink`): texto y filetes sobre el cartón.
- **Tinta sobre Amarillo** (`on-highlight`): texto sobre `highlight` (pegatina «¡Hoy!», selección).
- **Cartón** (card): contraportada, campo de búsqueda, tarjetas de estado, sello PAL y año del lomo.
- **Tinta Gastada** (card-ink-soft): texto secundario sobre cartón (crédito de IA, placeholder).
- **Tinta de Pared** (wall-ink) y **Tinta de Pared Suave** (wall-ink-soft): texto sobre la pared; la suave para navegación en reposo, etiquetas del buscador y pie.

### Named Rules
**The Two Grounds Rule.** Cada superficie lleva su tinta: sobre la pared, `wall-ink`/`wall-ink-soft`; sobre el cartón, `card-ink`/`card-ink-soft`; sobre el lomo, `highlight` o `wall-ink`. No se cruzan.

**The Sticker Red Rule.** En Videoclub el rojo es #d1281b porque lleva texto blanco pequeño y así alcanza AA (~5,2:1). En cualquier tema, `on-sticker` sobre `sticker` debe pasar AA; lo comprueba `lib/themes.test.ts`.

**The Band Color Rule.** El color de banda de una caja lo fija su plataforma (`band`, `sticker` o `highlight`, por hash del nombre; `sticker-band` sustituye a `sticker` en los temas donde la pegatina coincide con el lomo), como en las colecciones de una misma consola. La banda no codifica nada más.

## Typography

**Display Font:** Bungee (con Arial Black)
**Body Font:** Barlow (con system-ui)
**Label Font:** Barlow Condensed 600/800 (con Arial Narrow)

**Character:** Bungee es el logotipo impreso de la caja; Barlow Condensed en mayúsculas es la letra técnica de lomo y ficha; Barlow es la letra de lectura, sobria y abierta.

### Hierarchy
- **Display** (Bungee 400, clamp(2rem → 4.25rem), 1, mayúsculas, `text-wrap: balance`): el título del juego en la contraportada.
- **Headline** (Bungee 400, clamp(2rem → 3.5rem), 1, mayúsculas): título de página del archivo.
- **Title** (Bungee 400, clamp(1.5rem → 2rem), 1.1, mayúsculas): título de tarjeta de estado; la pegatina «¡Hoy!» usa Bungee 1.5rem.
- **Logo** (Bungee 400, clamp(1.75rem → 2.5rem), 0.04em, mayúsculas, amarillo con `text-shadow` rojo de 3 px): solo el logotipo DAILY BUG.
- **Body lead** (Barlow 400, clamp(1.0625rem → 1.25rem), 1.6, máx. 64ch): el texto del bug.
- **Body** (Barlow 400, 1rem, 1.5): texto base, campo de búsqueda (1.125rem), tarjetas de estado (1.125rem).
- **Data** (Barlow Condensed 800, 1.375rem, 1.2, mayúsculas, cifras tabulares): valores de la ficha técnica.
- **Label** (Barlow Condensed 800, 1–1.25rem, 0.08–0.16em, mayúsculas): navegación, lomos, plataforma del lomo, contadores.
- **Label small** (Barlow Condensed 600, 0.875rem, 0.12em, mayúsculas): rótulos de la ficha.
- **Credit** (Barlow Condensed 600, 0.9375rem, 0.06em, mayúsculas): crédito al pie de la caja.
- **Label extra small** (Barlow Condensed 800, 0.75rem, 0.08em, mayúsculas): «Bug nº» y fecha de la pegatina en móvil.
- **Spine title** (Bungee 400, 2.25rem; 1.5rem si el título pasa de 16 caracteres): título vertical del lomo de la caja y número de la pegatina en móvil.

### Named Rules
**The One Size Spine Rule.** En los lomos del archivo hay un solo tamaño de letra; el rango se da con peso (800/600), mayúsculas e inversión (amarillo sobre negro frente a negro sobre cartón).

**The Printed Display Rule.** Bungee solo rotula: logotipo, títulos, pegatinas, botones y el número del bug. Nunca texto corrido ni etiquetas.

## Layout

Todo el espaciado (padding, margin, gap) sale del módulo `--u` (8 px) en múltiplos (0.5, 1, 1.5, 2, 3, 4, 5, 6, 7); medio módulo (4 px) es para ajustes finos: hueco entre lomos y entre opciones, relleno de chapas. Las posiciones y desplazamientos (pegatinas que sobresalen de la caja, hueco reservado junto al título) usan cualquier múltiplo entero de `--u` (p. ej. `calc(var(--u) * -9)`). Los grosores de línea y del anillo de foco (2–4 px) no son espaciado y van en px. El margen lateral de página es `clamp(16px, 4vw, 48px)` y el ancho máximo del escenario, 1360 px; la caja mide hasta 1040 px.

La portada centra la caja de hoy de canto, con los lomos de días anteriores (56 px de ancho) a su derecha, a la misma altura, y una balda de madera de 40 px debajo que tapa la sombra de la caja. Por debajo de 1240 px los lomos bajan a una fila de 260 px de alto. El archivo es una pared de lomos (64 × 296 px) en filas con `flex-wrap`, sobre baldas dibujadas con un degradado repetido del alto exacto del lomo más 16 px de balda. Los lomos con título largo se ensanchan 1,5×.

Por debajo de 720 px el lomo de la caja pasa a ser una banda horizontal superior con solo «PAL», la ficha pasa a dos columnas (la fecha ocupa toda la fila), las pegatinas se reducen a 112 px y los lomos del archivo a 48 × 240 px.

## Elevation & Depth

La profundidad es de cartón sobre una balda: sombras duras, desplazadas y sin desenfoque. Por defecto son negras translúcidas (valores en `lib/themes.ts`); Neón y Verde LCD las tiñen con su paleta y acortan la de la caja a 8 px. No hay tonos de superficie elevada, brillos ni sombras difusas.

### Shadow Vocabulary
- **Caja** (`box-shadow: 10px 10px 0 rgb(0 0 0 / 0.4)`): la caja y las tarjetas de estado.
- **Pegatina** (`box-shadow: 3px 3px 0 rgb(0 0 0 / 0.35)`): pegatinas sobre la contraportada.
- **Balda** (`box-shadow: 0 12px 0 rgb(0 0 0 / 0.35)`): la balda de madera de la portada.
- **Desregistro** (`text-shadow: 3px 3px 0 var(--sticker)`): solo el logotipo, como una segunda tinta mal registrada.
- **Brillo** (`var(--glow)`): se suma a la sombra del logotipo, la caja y el título. Es transparente en todos los temas salvo Neón.

### Named Rules
**The Hard Shadow Rule.** Desenfoque siempre 0. Una sombra con blur no es de este mundo; la única excepción es `--glow` en el tema Neón.

**The Shelf Rests Rule.** Lo que descansa en la balda no proyecta sombra bajo su base: la balda va por encima (`z-index`) y la tapa.

## Shapes

Esquinas rectas en todo: cajas, lomos, botones, campos, celdas y tarjetas. La única curva es la pegatina del número (círculo de 184 px). Los bordes son filetes de tinta (3 px negro en la ficha y el pie de la caja) o bandas superiores gruesas de color (16 px en lomo y contraportada, 8 px en el buscador). Las pegatinas y cintas se giran (10°, −6°; −4° la chapa «Nuevo» del selector); el texto de los lomos va en vertical (`writing-mode: vertical-rl` girado 180°).

### Named Rules
**The Square Cardboard Rule.** Nada lleva `border-radius` salvo una pegatina redonda.

**The Top Band Rule.** El color de una pieza entra por una banda en su borde superior, nunca como relleno de la pieza.

## Components

Táctiles, impresos y secos: cada estado cambia de golpe, sin `transition`.

### Buttons
- **Shape:** rectángulo sin redondeo (0).
- **Botón de caja:** bloque de tinta negra con rotulación amarilla en Bungee 1.125rem mayúsculas; relleno 16 × 24 px; icono lucide opcional con 8 px de separación: a la derecha en acciones de avance («Ver toda la estantería →») y a la izquierda en las de cierre («× Devolver a la estantería»).
- **Hover:** fondo rojo pegatina y texto blanco, al instante.
- **Focus:** anillo global amarillo de 3 px con 3 px de separación.
- **Botón de estado:** misma receta con relleno 12 × 24 px y Bungee 1rem.

### Cards / Containers
- **Contraportada:** cartón, banda superior de 16 px del color de la plataforma, relleno 56 / clamp(24–56 px) / 32 px, pie separado por filete negro de 3 px.
- **Tarjeta de estado** (cargando, error, vacío, sin resultados): cartón, máx. 560 px, relleno 32 px, banda superior roja de 16 px, sombra de caja.
- **Shadow Strategy:** ver Elevation & Depth.

### Inputs / Fields
- **Buscador:** etiqueta de catálogo de cartón con banda superior amarilla de 8 px, sin borde ni redondeo; Barlow 1.125rem; icono de lupa y botón de borrar de lucide; cursor rojo.
- **Focus:** el anillo amarillo de 3 px rodea todo el campo (`:focus-within`), no solo el input.
- **Etiqueta y contador:** Barlow Condensed 800 en mayúsculas, `wall-ink-soft`, contador con cifras tabulares.

### Navigation
- **Cabecera:** logotipo a la izquierda, enlaces Hoy / Estantería a la derecha en Barlow Condensed 800 1.25rem mayúsculas, `wall-ink-soft` en reposo, `wall-ink` en hover.
- **Activo:** tira de cinta roja de 4 px debajo; la página actual se marca con la cinta, no con un color nuevo.
- **Selector de tema:** botón de cartón con banda superior de 4 px (`band`, `sticker` en hover), icono de paleta, «Tema» en Label y una muestra de 3 colores del tema actual. Abre un panel de cartón (popover) con banda de 16 px: cada tema es una fila con muestra y nombre en Label; la fila elegida va invertida (`highlight` sobre `spine`); los temas de temporada llevan la chapa «Nuevo» (pegatina rectangular `sticker`, girada −4°).
- **Pie:** Barlow 0.875rem `wall-ink-soft`, iconos sociales de lucide en áreas de 40 × 40 px; hover amarillo.

### Ficha técnica
Rejilla de tres celdas de cartón separadas por filetes negros de 3 px, con marco negro de 3 px; rótulo en Label small y valor en Data. La última celda va invertida (amarillo sobre negro).

### Valoración
Tres celdas de ficha técnica en el pie de la caja, a la derecha junto al botón: pulgar arriba, puntuación y pulgar abajo (lucide `ThumbsUp` / `ThumbsDown`, 24 px), con marco y filetes negros de 3 px. Celdas de cartón de 48 px de alto; los pulgares, cuadrados de 48 px. La puntuación (me gusta − no me gusta) en Bungee 1.125rem con cifras tabulares y signo (`+12`, `−3`, `0`), con ancho mínimo de 5ch para que no salte. La celda de la puntuación se tiñe según el signo con las tintas de pegatina: positiva en `highlight` con `on-highlight` (como «¡Hoy!»), negativa en `sticker` con `on-sticker`; el 0 queda en cartón. Hover: rojo pegatina con `on-sticker`, al instante. El voto propio va invertido (`highlight` sobre `spine`), como la última celda de la ficha y la fila elegida del selector; nunca un color nuevo. Pulsar el pulgar marcado quita el voto.

### Pegatinas
- **Número:** círculo rojo de 184 px girado 10°, «Bug nº» y fecha en Barlow Condensed 800, número en Bungee 3.5rem con cifras tabulares, sombra de pegatina; sobresale 24 px por la esquina superior derecha de la caja.
- **«¡Hoy!»:** rectángulo amarillo girado −6°, Bungee 1.5rem, apilado encima del número.

### Lomo (signature)
Lomo de tinta negra con banda superior de color de plataforma; título vertical en amarillo, año abajo sobre una tira de cartón. En la caja lleva sello «PAL» de cartón y el título en Bungee 2.25rem (1.5rem si pasa de 16 caracteres). En el archivo cada lomo es un enlace o botón que saca la caja: el hover ensancha la banda de 16 a 24 px y aclara el título; marcas «Hoy» (cinta amarilla arriba) y «Fuera» (cinta roja abajo, cuando la caja está abierta), ambas giradas −6°, sin tapar el título.

## Temas

Los colores y el ambiente vienen de `lib/themes.ts`, que es la fuente única. `themeCss()` genera un bloque `:root[data-theme="…"]` por tema. El de Videoclub también vale como `:root` por defecto, así que funciona sin JS. Un script en `<head>` (`themeInitScript()`) aplica el tema antes del primer pintado. El selector «Tema» de la cabecera lo cambia y lo guarda en `localStorage` (`daily-bug:theme`).

| Tema | Disponible | Pared | Cartón | Pegatina | Highlight | Banda | Ambiente |
|---|---|---|---|---|---|---|---|
| Videoclub (por defecto) | todo el año | #1d1b19 | #f2efe6 | #d1281b | #ffd23f | #2ec4d6 | — |
| Neón | todo el año | #0b0a1a | #15122e (tinta clara) | #ff2e88 | #f8f32b | #35f2ff | `--glow` cian, sombra de caja magenta de 8 px, líneas horizontales cian cada 32 px en la pared |
| Verde LCD | todo el año | #0f380f | #9bbc0f | #0f380f | #9bbc0f | #8bac0f | rejilla de píxeles de 4 px, sombras de caja (8 px) y pegatina en verde medio |
| Halloween | 1 oct – 1 nov | #160d1f | #f3e6cf | #6b2fa3 | #ff8a1f | #7bd13a | telarañas SVG en las esquinas superiores de la pared |
| Navidad | 1 nov – 9 ene | #0d2418 | #fbf6ec | #c8102e | #f2c14e | #2f8f5b | puntos de nieve sobre la pared |

### Named Rules
**The Season Rule.** Un tema de temporada se aplica solo la primera vez que alguien visita la web dentro de esa temporada (`daily-bug:seasons-seen`, con clave `<tema>-<año de inicio>`). Después manda la elección del usuario. Fuera de temporada desaparece del selector y, si estaba elegido, se vuelve a Videoclub. El 1 de noviembre se solapan Halloween y Navidad; gana la temporada que acaba de empezar.

**The Role Token Rule.** Cada tema define los 15 roles completos (`ThemeTokens`) y debe pasar AA en los pares de `lib/themes.test.ts`. Lo que cambia entre temas es la paleta y el ambiente; la tipografía, la estructura y la forma no cambian.

## Do's and Don'ts

### Do:
- **Do** derivar todo espaciado de `--u` (8 px).
- **Do** usar solo sombras de desenfoque 0 de la Shadow Vocabulary.
- **Do** marcar el color de una pieza con una banda superior (16 px en cajas y lomos, 8 px en el buscador).
- **Do** usar siempre los roles de color (`var(--sticker)`, `var(--card-ink)`…); los valores solo viven en `lib/themes.ts`.
- **Do** poner `on-sticker` sobre `sticker` y `highlight` sobre `spine` para rotulación.
- **Do** mantener el texto de lectura en Barlow a 64ch como máximo y 1.6 de interlínea.
- **Do** marcar estado actual con una cinta o pegatina (cinta roja de navegación, «Hoy», «Fuera»), no con un color nuevo.
- **Do** usar iconos de lucide-react como SVG.

### Don't:
- **Don't** usar `border-radius` salvo en la pegatina redonda.
- **Don't** añadir `transition` ni animaciones de estado: los cambios son secos. La única animación es la flotación del logotipo (4 s, 4 px), que se desactiva con `prefers-reduced-motion`.
- **Don't** usar sombras con desenfoque ni brillos fuera de `--glow` del tema Neón.
- **Don't** escribir colores literales en CSS ni componentes: cada tema debe poder cambiarlos.
- **Don't** usar fuentes pixel, fondo negro puro ni scanlines.
- **Don't** usar Bungee para texto corrido ni el cian para texto.
