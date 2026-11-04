// Color de la banda del lomo: fijo por plataforma, como en las colecciones de cajas de una misma consola.
// --sticker-band solo lo definen los temas cuyo color de pegatina coincide con el lomo (Game Boy).
const ACCENTS = ["var(--band)", "var(--sticker-band, var(--sticker))", "var(--highlight)"];

export function spineAccent(platform: string): string {
  let hash = 0;
  for (const char of platform.toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}
