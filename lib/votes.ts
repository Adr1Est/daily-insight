import "server-only";

import { z } from "zod";

import { isMockMode } from "@/lib/data";
import { getMockInsights } from "@/lib/mocks/insights";

/** 1 = me gusta, -1 = no me gusta, 0 = sin voto. */
export type VoteValue = -1 | 0 | 1;

/** Lo que ve un visitante: la puntuación del bug (me gusta − no me gusta) y su propio voto. */
export interface VoteState {
  score: number;
  myVote: VoteValue;
}

export const voteBodySchema = z.object({
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});

/** Cuánto cambia la puntuación al pasar de un voto a otro (p. ej. de 👎 a 👍 suma 2). */
export const voteDelta = (previous: VoteValue, next: VoteValue): number => next - previous;

const toVoteValue = (value: number | undefined): VoteValue =>
  value === 1 ? 1 : value === -1 ? -1 : 0;

// Prisma se importa solo en modo api, como en lib/data.ts.
const getPrisma = async () => (await import("@/lib/db")).getPrisma();

// DATA_SOURCE=mock: votos en memoria del proceso, para probar la UI sin BD. Se pierden al reiniciar.
const mockVotes = new Map<string, VoteValue>();
const mockScores = new Map<number, number>();

function mockScore(insightId: number): number | null {
  if (mockScores.has(insightId)) return mockScores.get(insightId)!;
  const bug = getMockInsights().find((insight) => insight.id === insightId);
  return bug ? bug.score : null;
}

/** Puntuación del bug y voto de este visitante; null si el bug no existe. */
export async function getVoteState(
  insightId: number,
  voterId: string | null,
): Promise<VoteState | null> {
  if (isMockMode()) {
    const score = mockScore(insightId);
    if (score === null) return null;
    return { score, myVote: voterId ? (mockVotes.get(`${insightId}:${voterId}`) ?? 0) : 0 };
  }

  const prisma = await getPrisma();
  const insight = await prisma.insight.findUnique({
    where: { id: insightId },
    select: {
      score: true,
      votes: voterId ? { where: { voterId }, select: { value: true } } : false,
    },
  });
  if (!insight) return null;
  return { score: insight.score, myVote: toVoteValue(insight.votes?.[0]?.value) };
}

/**
 * Registra, cambia o quita (value = 0) el voto de un visitante y devuelve el estado nuevo;
 * null si el bug no existe. El voto y la puntuación se actualizan en la misma transacción.
 */
export async function castVote(
  insightId: number,
  voterId: string,
  value: VoteValue,
): Promise<VoteState | null> {
  if (isMockMode()) {
    const score = mockScore(insightId);
    if (score === null) return null;
    const key = `${insightId}:${voterId}`;
    const next = score + voteDelta(mockVotes.get(key) ?? 0, value);
    if (value === 0) mockVotes.delete(key);
    else mockVotes.set(key, value);
    mockScores.set(insightId, next);
    return { score: next, myVote: value };
  }

  const prisma = await getPrisma();
  return prisma.$transaction(async (tx) => {
    // Bloquea la fila del bug: dos votos simultáneos del mismo navegador no pueden leer el mismo
    // voto previo y descuadrar la puntuación. De paso comprueba que el bug existe.
    const locked = await tx.$queryRaw<{ id: number }[]>`
      SELECT "id" FROM "daily_insight"."Insight" WHERE "id" = ${insightId} FOR UPDATE`;
    if (locked.length === 0) return null;

    const key = { insightId_voterId: { insightId, voterId } };
    const previous = await tx.vote.findUnique({ where: key, select: { value: true } });

    if (value === 0) {
      if (previous) await tx.vote.delete({ where: key });
    } else {
      await tx.vote.upsert({
        where: key,
        create: { insightId, voterId, value },
        update: { value },
      });
    }

    const delta = voteDelta(toVoteValue(previous?.value), value);
    const { score } = await tx.insight.update({
      where: { id: insightId },
      data: delta ? { score: { increment: delta } } : {},
      select: { score: true },
    });
    return { score, myVote: value };
  });
}

/** Un voto del visitante, con lo justo para listarlo en /ajustes. */
export interface MyVote {
  id: number;
  game: string;
  platform: string;
  bugYear: number;
  value: 1 | -1;
}

/** Los votos de un visitante, del más reciente al más antiguo (como mucho uno por bug). */
export async function getMyVotes(voterId: string): Promise<MyVote[]> {
  if (isMockMode()) {
    const bugs = new Map(getMockInsights().map((bug) => [bug.id, bug]));
    const mine: MyVote[] = [];
    for (const [key, value] of mockVotes) {
      const [id, voter] = key.split(":");
      const bug = bugs.get(Number(id));
      if (voter !== voterId || !bug || value === 0) continue;
      const { game, platform, bugYear } = bug;
      mine.push({ id: bug.id, game, platform, bugYear, value });
    }
    return mine.reverse(); // el Map conserva el orden de inserción: el último voto, primero
  }

  const prisma = await getPrisma();
  const votes = await prisma.vote.findMany({
    where: { voterId },
    orderBy: { updatedAt: "desc" },
    select: {
      value: true,
      insight: { select: { id: true, game: true, platform: true, bugYear: true } },
    },
  });
  return votes.map(({ value, insight }) => ({ ...insight, value: value === 1 ? 1 : -1 }));
}

/**
 * Borra todos los votos de un visitante y descuenta cada uno de la puntuación de su bug, en la
 * misma transacción. Devuelve cuántos votos se han borrado.
 */
export async function forgetVoter(voterId: string): Promise<number> {
  if (isMockMode()) {
    let deleted = 0;
    for (const [key, value] of mockVotes) {
      const [id, voter] = key.split(":");
      if (voter !== voterId) continue;
      const insightId = Number(id);
      mockScores.set(insightId, (mockScore(insightId) ?? 0) - value);
      mockVotes.delete(key);
      deleted++;
    }
    return deleted;
  }

  const prisma = await getPrisma();
  return prisma.$transaction(async (tx) => {
    // UPDATE … FROM bloquea las filas de los bugs, como castVote: no se cruza con un voto a la vez.
    await tx.$executeRaw`
      UPDATE "daily_insight"."Insight" AS i
      SET "score" = i."score" - v."value"
      FROM "daily_insight"."Vote" AS v
      WHERE v."insightId" = i."id" AND v."voterId" = ${voterId}::uuid`;
    const { count } = await tx.vote.deleteMany({ where: { voterId } });
    return count;
  });
}
