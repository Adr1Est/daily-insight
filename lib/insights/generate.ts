import "server-only";
import { Agent, run } from "@openai/agents";
import type { BugType } from "@/types/bug";
import { getPrisma } from "@/lib/db";
import { agentOutputSchema, insightSchema, type InsightInput } from "@/lib/insights/schema";
import { spanishDate, type SpanishDate } from "@/lib/insights/date";
import { AI_MODEL } from "@/lib/insights/model";

const MAX_ATTEMPTS = 3;

/** Enfoques que se sugieren al azar cada día para que el modelo no vuelva siempre a los casos más famosos. */
export const FOCUSES = [
  "un arcade de los años 70 u 80",
  "una consola de 8 o 16 bits (NES, Master System, Mega Drive, Super Nintendo...)",
  "un juego de ordenador doméstico de los 80 (Spectrum, Amstrad, Commodore, MSX...)",
  "una consola portátil (Game Boy, Game Gear, Nintendo DS, PSP, 3DS...)",
  "un juego de PC de los años 90",
  "la generación de PlayStation, Nintendo 64 y Saturn",
  "la generación de PlayStation 2, GameCube y Xbox",
  "la generación de PlayStation 3, Xbox 360 y Wii",
  "un juego publicado de 2015 en adelante",
  "un juego online o multijugador",
  "un fallo de hardware de una consola o de un servicio de juego online",
  "un juego de móvil",
  "un exploit famoso del mundo del speedrun",
  "un juego de estrategia, rol o simulación",
];

export const INSTRUCTIONS = `Eres divulgador experto en la historia técnica de los videojuegos. Cada día escribes una curiosidad breve para Daily Bug, una web en español de España para aficionados.

# Qué elegir
Un bug, glitch, exploit o fallo técnico real y documentado de un videojuego, de una consola o de un servicio de juego online (por ejemplo, un desbordamiento en un arcade, un exploit de speedrun, un fallo de hardware de una consola o la caída de una red de juego). Prioriza casos cuya causa técnica se conozca.

# Veracidad
- No inventes nombres, cifras, fechas, versiones ni mecánicas.
- Si no estás seguro de un detalle, no lo incluyas; si dudas del caso entero, elige otro.
- Descarta leyendas urbanas y mitos desmentidos.

# Variedad
- No uses ningún juego ni producto de la lista de ya publicados que te pasa el usuario. Hay miles de videojuegos: busca más allá de los casos más famosos.
- Alterna épocas (de los años 70 a hoy), plataformas (arcade, consolas, portátiles, PC, móvil, online) y tipos de fallo (exploit, desbordamiento, corrupción de datos, físicas, red, hardware...).

# Campos
- game: título oficial tal como se conoce en España. Si el fallo es de hardware o de un servicio, el nombre del producto (por ejemplo «Xbox 360» o «PlayStation Network»). Nunca un texto genérico.
- platform: plataforma o plataformas donde ocurría, separadas por comas, como máximo 3.
- bugYear: año en que el fallo llegó al público (lanzamiento, parche o incidente).
- data: la explicación.

# Cómo escribir data
- Breve: de 2 a 4 frases y entre 250 y 500 caracteres en total.
- Cuenta qué pasaba, por qué pasaba (la causa técnica, explicada para cualquiera) y qué consecuencia o curiosidad dejó.
- Tono cercano, divulgativo y con chispa, sin chistes forzados.
- Texto plano: sin markdown, listas, emojis ni comillas de cita.
- No empieces con «¿Sabías que...?» ni repitiendo el título del juego.`;

export const insightAgent = new Agent({
  name: "Daily Bug",
  instructions: INSTRUCTIONS,
  model: AI_MODEL,
  // Recordar un caso concreto y no repetir no requiere más razonamiento; así se gastan menos tokens.
  modelSettings: { reasoning: { effort: "low" } },
  outputType: agentOutputSchema,
});

/** Normaliza un título para comparar repeticiones («Pokémon Rojo/Azul» ≈ «pokemon rojo azul»). */
export const normalizeTitle = (title: string) =>
  title.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

interface PromptInput {
  /** Títulos ya publicados (todo el historial, sin repetidos). */
  usedGames: string[];
  /** Enfoque sugerido para hoy. */
  focus: string;
  /** Títulos propuestos en intentos anteriores de hoy que ya estaban usados. */
  rejected?: string[];
}

export function buildPrompt({ usedGames, focus, rejected = [] }: PromptInput): string {
  const parts: string[] = [];
  if (usedGames.length > 0) {
    parts.push(`Juegos y productos ya publicados; no uses ninguno:\n${usedGames.join("; ")}`);
  }
  if (rejected.length > 0) {
    parts.push(`Ya propusiste ${rejected.map(game => `«${game}»`).join(", ")}, que está publicado. Elige otro distinto.`);
  }
  parts.push(`Sugerencia para hoy, si conoces un caso real y bien documentado: ${focus}. Si no, elige otro que cumpla las reglas.`);
  parts.push("Escribe la curiosidad de hoy.");
  return parts.join("\n\n");
}

export type GenerateResult =
  | { status: "created"; insight: BugType }
  | { status: "skipped"; insight: BugType }
  | { status: "preview"; insight: InsightInput & SpanishDate };

interface GenerateOptions {
  now?: Date;
  /** Genera y valida sin comprobar el bug de hoy ni guardar nada (para revisar el prompt). */
  dryRun?: boolean;
  /** Fuente de azar para el enfoque del día (inyectable en tests). */
  random?: () => number;
}

/**
 * Genera y guarda el bug del día. Es idempotente: si ya hay un bug con la fecha de hoy, no hace nada.
 * La fecha la pone el servidor y la salida del modelo se valida antes de insertar.
 */
export async function generateDailyInsight({ now = new Date(), dryRun = false, random = Math.random }: GenerateOptions = {}): Promise<GenerateResult> {
  const prisma = getPrisma();
  const date = spanishDate(now);

  if (!dryRun) {
    const existing = await prisma.insight.findFirst({ where: date });
    if (existing) return { status: "skipped", insight: existing };
  }

  // Todo el historial de títulos (no solo los últimos días), para no reciclar juegos antiguos.
  const usedGames = (await prisma.insight.findMany({ distinct: ["game"], select: { game: true }, orderBy: { game: "asc" } }))
    .map(row => row.game)
    .filter(game => normalizeTitle(game) !== "no es un juego");
  const used = new Set(usedGames.map(normalizeTitle));
  const focus = FOCUSES[Math.floor(random() * FOCUSES.length)];

  const rejected: string[] = [];
  let parsed = insightSchema.parse((await run(insightAgent, buildPrompt({ usedGames, focus }))).finalOutput);
  while (used.has(normalizeTitle(parsed.game)) && rejected.length < MAX_ATTEMPTS - 1) {
    rejected.push(parsed.game);
    parsed = insightSchema.parse((await run(insightAgent, buildPrompt({ usedGames, focus, rejected }))).finalOutput);
  }
  if (used.has(normalizeTitle(parsed.game))) {
    console.warn(`[generate] «${parsed.game}» ya estaba publicado tras ${MAX_ATTEMPTS} intentos; se publica igualmente.`);
  }

  if (dryRun) return { status: "preview", insight: { ...parsed, ...date } };

  const insight = await prisma.insight.create({ data: { ...parsed, ...date } });
  return { status: "created", insight };
}
