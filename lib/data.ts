import type { BugType } from "@/app/types/bug.types";
import { getMockInsights } from "@/lib/mocks/insights";

// DATA_SOURCE=mock sirve los bugs de lib/mocks en lugar de la base de datos.
// Solo afecta a la lectura (portada, /bugs y /api/getBugs); la generación diaria siempre usa la BD.
export const isMockMode = () => process.env.DATA_SOURCE === "mock";

// Prisma se importa solo en modo api, para que el modo mock funcione sin DATABASE_URL.
const getPrisma = async () => (await import("@/lib/prisma")).default;

/** Todos los bugs, del más reciente al más antiguo. */
export async function getAllInsights(): Promise<BugType[]> {
  if (isMockMode()) return getMockInsights().reverse();
  const prisma = await getPrisma();
  return prisma.insight.findMany({ orderBy: { id: "desc" } });
}

/** Los `count` bugs más recientes; el primero es el bug del día. */
export async function getLatestInsights(count: number): Promise<BugType[]> {
  if (isMockMode()) return getMockInsights().reverse().slice(0, count);
  const prisma = await getPrisma();
  return prisma.insight.findMany({ orderBy: { id: "desc" }, take: count });
}
