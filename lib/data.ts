import "server-only";

import { getEnv } from "@/lib/env";
import { getMockInsights } from "@/lib/mocks/insights";
import { paginate, type InsightsPage, type PageParams } from "@/lib/pagination";
import type { BugType } from "@/types/bug";

// DATA_SOURCE=mock sirve los bugs de lib/mocks en lugar de la base de datos.
// Solo afecta a la lectura (portada, /bugs y /api/bugs); la generación diaria siempre usa la BD.
export const isMockMode = () => getEnv().DATA_SOURCE === "mock";

// Prisma se importa solo en modo api, para que el modo mock funcione sin DATABASE_URL.
const getPrisma = async () => (await import("@/lib/db")).getPrisma();

/**
 * Una página del archivo, del más reciente al más antiguo, con búsqueda opcional por juego,
 * plataforma, texto (sin distinguir mayúsculas) o año exacto. Nunca devuelve más de `limit` bugs.
 */
export async function getInsightsPage({ limit, cursor, q }: PageParams): Promise<InsightsPage> {
  if (isMockMode()) return paginate(getMockInsights().reverse(), { limit, cursor, q });

  const prisma = await getPrisma();
  const year = q && /^\d{4}$/.test(q) ? Number(q) : undefined;
  const where = q
    ? {
        OR: [
          { game: { contains: q, mode: "insensitive" as const } },
          { platform: { contains: q, mode: "insensitive" as const } },
          { data: { contains: q, mode: "insensitive" as const } },
          ...(year ? [{ bugYear: year }] : []),
        ],
      }
    : {};

  // Se pide uno de más para saber si hay página siguiente sin otra consulta.
  // Sin búsqueda, el total y las coincidencias son la misma cuenta: una consulta menos.
  const [rows, total, matching] = await Promise.all([
    prisma.insight.findMany({
      where: cursor ? { AND: [where, { id: { lt: cursor } }] } : where,
      orderBy: { id: "desc" },
      take: limit + 1,
    }),
    prisma.insight.count(),
    q ? prisma.insight.count({ where }) : null,
  ]);

  const items = rows.slice(0, limit);
  return {
    items,
    nextCursor: rows.length > limit ? items[items.length - 1].id : null,
    total,
    matching: matching ?? total,
  };
}

/** Un bug concreto (enlaces /bugs#bug-N a cajas que aún no están cargadas). */
export async function getInsightById(id: number): Promise<BugType | null> {
  if (isMockMode()) return getMockInsights().find((bug) => bug.id === id) ?? null;
  const prisma = await getPrisma();
  return prisma.insight.findUnique({ where: { id } });
}

/** Los `count` bugs más recientes; el primero es el bug del día. */
export async function getLatestInsights(count: number): Promise<BugType[]> {
  if (isMockMode()) return getMockInsights().reverse().slice(0, count);
  const prisma = await getPrisma();
  return prisma.insight.findMany({ orderBy: { id: "desc" }, take: count });
}

export const TOP_SIZE = 50;

/**
 * Los `count` bugs con más puntuación (me gusta − no me gusta), de mayor a menor. Solo entran los
 * de puntuación positiva; a igual puntuación, el más reciente primero.
 */
export async function getTopInsights(count = TOP_SIZE): Promise<BugType[]> {
  if (isMockMode()) {
    return getMockInsights()
      .filter((bug) => bug.score > 0)
      .sort((a, b) => b.score - a.score || b.id - a.id)
      .slice(0, count);
  }
  const prisma = await getPrisma();
  return prisma.insight.findMany({
    where: { score: { gt: 0 } },
    orderBy: [{ score: "desc" }, { id: "desc" }],
    take: count,
  });
}
