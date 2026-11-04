// Color de la banda del lomo: fijo por plataforma, como en las colecciones de cajas de una misma consola.
const ACCENTS = ["var(--cyan)", "var(--red)", "var(--yellow)"];

export function spineAccent(platform: string): string {
  let hash = 0;
  for (const char of platform.toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}
