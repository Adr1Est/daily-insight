import "server-only";
import { Agent, run } from "@openai/agents";
import type { BugType } from "@/types/bug";
import { getPrisma } from "@/lib/db";
import { agentOutputSchema, insightSchema } from "@/lib/insights/schema";
import { spanishDate } from "@/lib/insights/date";

const CONTEXT_SIZE = 30;

export const insightAgent = new Agent({
  name: "Daily Bug",
  instructions: `Eres un modelo experto en videojuegos, especializado en bugs, glitches y fallos técnicos documentados.
Cada respuesta describe un bug, glitch o fallo conocido y real de la historia de los videojuegos:
- game: el videojuego relacionado. Si no es un juego, «no es un juego».
- platform: la plataforma en la que ocurrió (por ejemplo Nintendo 64, Xbox, PS5, PC).
- bugYear: el año en que ocurrió.
- data: una explicación detallada en español, de 10 líneas como máximo.
No repitas juegos ni datos de respuestas anteriores.`,
  model: "gpt-5-nano",
  outputType: agentOutputSchema,
});

export function buildPrompt(previous: Pick<BugType, "game" | "data">[]): string {
  if (previous.length === 0) {
    return "Dame un dato sobre bugs y fallos conocidos de la historia de los videojuegos.";
  }
  const lastResponses = previous.map((info, index) => `${index + 1}. ${info.game}: ${info.data}`).join("\n");
  return `Dada una lista de últimas respuestas:
${lastResponses}
Dame un dato sobre bugs y fallos conocidos de la historia de los videojuegos evitando repetir datos y videojuegos anteriores.`;
}

export type GenerateResult =
  | { status: "created"; insight: BugType }
  | { status: "skipped"; insight: BugType };

/**
 * Genera y guarda el bug del día. Es idempotente: si ya hay un bug con la fecha de hoy, no hace nada.
 * La fecha la pone el servidor y la salida del modelo se valida antes de insertar.
 */
export async function generateDailyInsight(now: Date = new Date()): Promise<GenerateResult> {
  const prisma = getPrisma();
  const { day, month, year } = spanishDate(now);

  const existing = await prisma.insight.findFirst({ where: { day, month, year } });
  if (existing) return { status: "skipped", insight: existing };

  const previous = await prisma.insight.findMany({
    orderBy: { id: "desc" },
    take: CONTEXT_SIZE,
    select: { game: true, data: true },
  });

  const result = await run(insightAgent, buildPrompt(previous));
  const parsed = insightSchema.parse(result.finalOutput);

  const insight = await prisma.insight.create({ data: { ...parsed, day, month, year } });
  return { status: "created", insight };
}
