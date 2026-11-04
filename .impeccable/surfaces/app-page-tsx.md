---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/bugs/page.tsx"]
---

# Daily Bug — portada y archivo

## Scope

Portada (`/`, el bug del día) y archivo (`/bugs`, estantería con buscador). Modo: Read. Build code-led. Rediseño completo; se elimina shadcn.

## Audience and job

Gamers curiosos que leen el bug del día en menos de un minuto y, si les pica, curiosean el archivo o buscan un juego concreto. Funciones idénticas a las actuales; solo cambia la presentación. El archivo es una estantería de lomos: cada lomo se abre en su contraportada con el texto completo.

## Constraints

- Contenido real de la BD; con `DATA_SOURCE=mock` la lectura sale de mocks locales (12 bugs reales).
- El texto es de un modelo: longitud variable, `game` puede ser "no es un juego".
- Responsive desde 360 px; el texto del bug a 60–75 caracteres de medida y ~18–20 px.
- Rojo de pegatina #d1281b en lugar de #e63022: el texto blanco pequeño sobre #e63022 se queda en ~4,4:1; con #d1281b llega a ~5,2:1 (AA).

## Direction contract

THESIS: Cada bug del día es la contraportada de una caja PAL de videoclub, y el archivo es la estantería de lomos. Rechaza el «sitio retro» por defecto: fondo negro, fuente pixel, neón y scanlines.

OWN-WORLD: Estante de madera oscura sobre pared de listones; cajas con lomo negro (#141414) y contraportada de cartón claro (#f2efe6); rojo pegatina #e63022, amarillo #ffd23f, cian de banda #2ec4d6. Display Bungee como logotipo de caja impreso; Barlow Condensed en mayúsculas para etiquetas; Barlow para leer. Sombras duras desplazadas, sin desenfoque ni brillos. Las pegatinas, redondas o rectas, giradas, se apilan.

STORY: El visitante ve la caja de hoy, lee juego, plataforma y año en el lomo y la ficha, lee el bug en la contraportada y entiende que cada día llega una caja nueva a la estantería. Después pulsa «Ver toda la estantería».

FIRST VIEWPORT: Cabecera fina: logotipo DAILY BUG a la izquierda, navegación Hoy / Estantería a la derecha. En el centro, una caja enorme de canto: el lomo a la izquierda (PAL, título en vertical, plataforma · año) y la contraportada a la derecha con la pegatina «Bug nº N» (fecha), el antetítulo de fecha, el título del juego grande, la ficha de tres celdas (juego, plataforma, año) y el texto en columna. Pie de la caja: crédito de IA y autoría; CTA negro «Ver toda la estantería». A la derecha asoman lomos del archivo. Estante de madera abajo. En móvil, el lomo pasa a ser una banda horizontal superior.
Signature interaction: en /bugs, pulsar un lomo lo saca de la estantería y abre su contraportada; el cambio es seco, sin deslizamientos.

FORM: Estantería de videoclub, 7.º de mi lista ordenada (asignado por el dado). seed:a49892c1d4d6079d
Raises: un módulo de 8 px y un número de bug grande como rango (instrucciones de bloques); el archivo con un solo tamaño de letra y el rango por peso, mayúsculas e inversión (horario); «HOY» como pegatina, no como color (mesa de montaje); las pegatinas apiladas por orden de llegada (flight case); cambios secos sin transiciones (Nixie); la caja del día como paquete compacto que se despliega en el archivo (Miura).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
