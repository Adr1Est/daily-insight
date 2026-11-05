// Tipos de curiosidad. Fuente única para la BD (CHECK de la migración), el esquema del agente,
// el prompt y la UI (pegatina «<Tipo> nº N» y búsqueda). Sin `server-only`: también lo usa el cliente.

export const KINDS = [
  {
    id: "bug",
    label: "Bug",
    guide:
      "Un bug, glitch, exploit o fallo técnico real: un desbordamiento en un arcade, un exploit de speedrun, un fallo de hardware de una consola o la caída de una red de juego. Cuenta qué pasaba, su causa técnica y qué consecuencia dejó.",
  },
  {
    id: "secreto",
    label: "Secreto",
    guide:
      "Un easter egg o secreto real: una sala oculta, unos créditos escondidos, un truco o un código que los desarrolladores dejaron a propósito. Cuenta qué era, cómo se descubría y por qué se escondió. Descarta rumores y trucos que nunca existieron.",
  },
  {
    id: "desarrollo",
    label: "Desarrollo",
    guide:
      "Una historia de desarrollo: una limitación técnica o una decisión de diseño que explica algo del juego (por qué tiene niebla, por qué un personaje es así). Cuenta el problema, la solución y lo que dejó en el juego final. Solo hechos que contaron sus creadores o que estén bien documentados.",
  },
  {
    id: "descartado",
    label: "Descartado",
    guide:
      "Contenido descartado: un nivel, personaje, arma o modo que se programó pero se quitó antes del lanzamiento y apareció después en el código, en un prototipo o en declaraciones de sus creadores. Cuenta qué era, por qué se quitó y cómo se descubrió. Descarta lo que solo aparece en foros sin fuente.",
  },
  {
    id: "localizacion",
    label: "Localización",
    guide:
      "Una curiosidad de localización o censura: una traducción célebre, un cambio de nombre o de contenido entre regiones, o una versión censurada. Cuenta qué cambió, en qué versión y por qué. Si es de la versión española, mejor.",
  },
] as const;

export type InsightKind = (typeof KINDS)[number]["id"];

export const KIND_IDS = KINDS.map((kind) => kind.id) as [InsightKind, ...InsightKind[]];

export const DEFAULT_KIND: InsightKind = "bug";

export const isKind = (value: unknown): value is InsightKind =>
  typeof value === "string" && (KIND_IDS as string[]).includes(value);

/** Rótulo corto del tipo para la pegatina («Secreto nº 12»). Un valor desconocido cuenta como bug. */
export const kindLabel = (kind: string): string =>
  KINDS.find((k) => k.id === kind)?.label ?? KINDS[0].label;

/** Tipos cuyo rótulo contiene la búsqueda, sin distinguir mayúsculas ni tildes («localizacion»). */
export function kindsMatching(q: string): InsightKind[] {
  const fold = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const query = fold(q.trim());
  if (!query) return [];
  return KINDS.filter((k) => fold(k.label).includes(query)).map((k) => k.id);
}
