import "server-only";

import { Agent, run } from "@openai/agents";

import { getPrisma } from "@/lib/db";
import { findRelease, isNewRelease, type Release } from "@/lib/insights/calendar";
import { spanishDate, type SpanishDate } from "@/lib/insights/date";
import { DEFAULT_KIND, isKind, KINDS, type InsightKind } from "@/lib/insights/kinds";
import { AI_MODEL } from "@/lib/insights/model";
import { agentOutputSchema, insightSchema, type InsightInput } from "@/lib/insights/schema";
import type { BugType } from "@/types/bug";

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
  "una consola, un periférico o un servicio de juego online",
  "un juego de móvil",
  "un juego de estrategia, rol o simulación",
];

export const INSTRUCTIONS = `Eres divulgador experto en la historia de los videojuegos. Cada día escribes una curiosidad breve para Daily Bug, una web en español de España para aficionados.

# Qué elegir
Un caso real y documentado del tipo que te pida el usuario. Los tipos son:
${KINDS.map((kind) => `- ${kind.id}: ${kind.guide}`).join("\n")}

# Veracidad
- No inventes nombres, cifras, fechas, versiones ni mecánicas.
- Si no estás seguro de un detalle, no lo incluyas; si dudas del caso entero, elige otro.
- Descarta leyendas urbanas y mitos desmentidos.

# Variedad
- No repitas ningún juego ni producto de la lista de ya publicados que te pasa el usuario. Hay miles de videojuegos: busca más allá de los casos más famosos.
- Alterna épocas (de los años 70 a hoy) y plataformas (arcade, consolas, portátiles, PC, móvil, online).

# Campos
- kind: el tipo de la curiosidad (el que te pidan; si te dejan elegir, el que mejor encaje).
- game: título oficial tal como se conoce en España. Si trata de hardware o de un servicio, el nombre del producto (por ejemplo «Xbox 360» o «PlayStation Network»). Nunca un texto genérico.
- platform: plataforma o plataformas del juego o de la versión de la que hablas, separadas por comas, como máximo 3.
- bugYear: año del hecho (cuando el fallo, el secreto, la versión o el contenido llegó al público o se descubrió).
- data: la explicación.

# Cómo escribir data
- Breve: de 2 a 4 frases y entre 250 y 500 caracteres en total.
- Cuenta qué era, por qué pasó (la causa técnica o la decisión, explicada para cualquiera) y qué consecuencia o curiosidad dejó.
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
  title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Tipo del día: los cinco con la misma probabilidad. */
export const pickKind = (random: () => number = Math.random): InsightKind =>
  KINDS[Math.min(KINDS.length - 1, Math.floor(random() * KINDS.length))].id;

const kindGuide = (kind: InsightKind) => KINDS.find((k) => k.id === kind)!.guide;

interface PromptInput {
  kind: InsightKind;
  /** Títulos ya publicados con este tipo (todo el historial, sin repetidos). */
  usedGames: string[];
  /** Enfoque sugerido para hoy. */
  focus: string;
  /** Títulos propuestos en intentos anteriores de hoy que ya estaban usados. */
  rejected?: string[];
}

export function buildPrompt({ kind, usedGames, focus, rejected = [] }: PromptInput): string {
  const parts: string[] = [`Tipo de hoy: ${kind}. ${kindGuide(kind)}`];
  if (usedGames.length > 0) {
    parts.push(
      `Juegos y productos ya publicados con este tipo; no uses ninguno:\n${usedGames.join("; ")}`,
    );
  }
  if (rejected.length > 0) {
    parts.push(
      `Ya propusiste ${rejected.map((game) => `«${game}»`).join(", ")}, que está publicado. Elige otro distinto.`,
    );
  }
  parts.push(
    `Sugerencia para hoy, si conoces un caso real y bien documentado: ${focus}. Si no, elige otro que cumpla las reglas.`,
  );
  parts.push("Escribe la curiosidad de hoy.");
  return parts.join("\n\n");
}

interface EventPromptInput {
  release: Release;
  /** true si el juego sale este año: el modelo aún no puede conocerlo. */
  isNew: boolean;
  /** Curiosidades ya publicadas de ese juego, para no repetirlas. */
  previous: { kind: string; data: string }[];
  /** Tipos ya propuestos hoy para este juego que estaban publicados. */
  rejectedKinds?: string[];
}

export function buildEventPrompt({
  release,
  isNew,
  previous,
  rejectedKinds = [],
}: EventPromptInput): string {
  const { game, platform, year, note } = release;
  const parts: string[] = [
    isNew
      ? `Hoy sale ${game} (${platform}).${note ? ` ${note}.` : ""} Escribe una curiosidad relacionada con este lanzamiento. No conoces el juego publicado: habla de su desarrollo ya anunciado o de la historia de su saga o de su estudio, nunca de detalles del juego final. En game, platform y bugYear pon los del juego del que trata la curiosidad: «${game}» solo si hablas del nuevo lanzamiento; si hablas del juego original o de otro de la saga, su título oficial en España, sin añadidos como «remake» o «remaster».`
      : `Hoy es el aniversario de ${game} (${platform}, ${year}).${note ? ` ${note}.` : ""} Escribe una curiosidad sobre ${game}. En game pon «${game}».`,
    `Elige el tipo (kind) que mejor encaje con lo que cuentes: ${KINDS.map((k) => k.id).join(", ")}.`,
  ];
  if (previous.length > 0) {
    parts.push(
      `Ya se publicó sobre este juego; cuenta algo distinto:\n${previous.map((p) => `- (${p.kind}) ${p.data}`).join("\n")}`,
    );
  }
  if (rejectedKinds.length > 0) {
    parts.push(
      `Ya hay una curiosidad de tipo ${rejectedKinds.join(", ")} sobre este juego. Usa otro tipo.`,
    );
  }
  return parts.join("\n\n");
}

export type GenerateResult =
  | { status: "created"; insight: BugType }
  | { status: "skipped"; insight: BugType }
  | { status: "preview"; insight: InsightInput & SpanishDate; release?: Release };

interface GenerateOptions {
  now?: Date;
  /** Genera y valida sin comprobar la curiosidad de hoy ni guardar nada (para revisar el prompt). */
  dryRun?: boolean;
  /** Fuerza el tipo (solo en pruebas; en un día con evento se ignora). */
  kind?: InsightKind;
  /** Fuente de azar para el tipo y el enfoque del día (inyectable en tests). */
  random?: () => number;
  /** Calendario de lanzamientos (inyectable en tests). */
  releases?: Release[];
}

/**
 * Genera y guarda la curiosidad del día. Es idempotente: si ya hay una con la fecha de hoy, no hace
 * nada. La fecha la pone el servidor y la salida del modelo se valida antes de insertar.
 */
export async function generateDailyInsight({
  now = new Date(),
  dryRun = false,
  kind: forcedKind,
  random = Math.random,
  releases,
}: GenerateOptions = {}): Promise<GenerateResult> {
  const prisma = getPrisma();
  const date = spanishDate(now);

  if (!dryRun) {
    const existing = await prisma.insight.findFirst({ where: date });
    if (existing) return { status: "skipped", insight: existing as BugType };
  }

  // Todo el historial (no solo los últimos días), para no reciclar juegos antiguos. Lo que se
  // evita repetir es el juego dentro de un mismo tipo: un juego con un bug puede volver con un secreto.
  const history = (
    await prisma.insight.findMany({
      select: { game: true, kind: true, data: true },
      orderBy: { game: "asc" },
    })
  ).filter((row) => normalizeTitle(row.game) !== "no es un juego");
  const kindOf = (row: { kind?: string | null }) => (isKind(row.kind) ? row.kind : DEFAULT_KIND);
  const usedPairs = new Set(history.map((row) => `${kindOf(row)}:${normalizeTitle(row.game)}`));
  const isUsed = (out: InsightInput) => usedPairs.has(`${out.kind}:${normalizeTitle(out.game)}`);

  const release = findRelease(now, releases);
  let parsed: InsightInput;

  if (release) {
    // Día de lanzamiento o aniversario: el tema es ese juego y el modelo elige el tipo.
    const game = normalizeTitle(release.game);
    const previous = history
      .filter((row) => normalizeTitle(row.game) === game)
      .map((row) => ({ kind: kindOf(row), data: row.data }));
    const prompt = (rejectedKinds: string[]) =>
      buildEventPrompt({ release, isNew: isNewRelease(release, now), previous, rejectedKinds });

    const rejectedKinds: string[] = [];
    parsed = insightSchema.parse((await run(insightAgent, prompt(rejectedKinds))).finalOutput);
    while (isUsed(parsed) && rejectedKinds.length < MAX_ATTEMPTS - 1) {
      rejectedKinds.push(parsed.kind);
      parsed = insightSchema.parse((await run(insightAgent, prompt(rejectedKinds))).finalOutput);
    }
  } else {
    const kind = forcedKind ?? pickKind(random);
    const focus = FOCUSES[Math.floor(random() * FOCUSES.length)];
    const usedGames = [
      ...new Set(history.filter((row) => kindOf(row) === kind).map((row) => row.game)),
    ];

    const rejected: string[] = [];
    // El tipo lo decide el servidor: si el modelo devuelve otro, se corrige.
    const ask = async () => ({
      ...insightSchema.parse(
        (await run(insightAgent, buildPrompt({ kind, usedGames, focus, rejected }))).finalOutput,
      ),
      kind,
    });
    parsed = await ask();
    while (isUsed(parsed) && rejected.length < MAX_ATTEMPTS - 1) {
      rejected.push(parsed.game);
      parsed = await ask();
    }
  }

  if (isUsed(parsed)) {
    console.warn(
      `[generate] «${parsed.game}» (${parsed.kind}) ya estaba publicado tras ${MAX_ATTEMPTS} intentos; se publica igualmente.`,
    );
  }

  if (dryRun) {
    return { status: "preview", insight: { ...parsed, ...date }, ...(release ? { release } : {}) };
  }

  // El lanzamiento se copia en el bug: la chapa del archivo no depende del calendario actual.
  const releaseFields = release
    ? { releaseGame: release.game, releasePlatform: release.platform, releaseYear: release.year }
    : {};
  const insight = await prisma.insight.create({ data: { ...parsed, ...date, ...releaseFields } });
  return { status: "created", insight: insight as BugType };
}
