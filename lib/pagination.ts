import { z } from "zod";

import { KIND_IDS, kindsMatching, type InsightKind } from "@/lib/insights/kinds";
import type { BugType } from "@/types/bug";

// Paginación del archivo por cursor: cada página son los `limit` bugs con id menor que `cursor`,
// del más reciente al más antiguo. Es estable aunque se publiquen bugs nuevos y no se degrada con
// el tamaño de la tabla (la clave es el id, que es la clave primaria).

export const PAGE_SIZE = 15;
export const MAX_PAGE_SIZE = 50;
export const MAX_QUERY_LENGTH = 100;

export const pageParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(PAGE_SIZE),
  cursor: z.coerce.number().int().positive().optional(),
  q: z
    .string()
    .trim()
    .max(MAX_QUERY_LENGTH)
    .optional()
    .transform((q) => q || undefined),
  /** Filtro por tipo de curiosidad (lib/insights/kinds.ts). */
  kind: z.enum(KIND_IDS).optional(),
});

export interface PageParams {
  limit: number;
  cursor?: number;
  q?: string;
  kind?: InsightKind;
}

export interface InsightsPage {
  items: BugType[];
  /** Cursor para pedir la página siguiente; `null` si no hay más. */
  nextCursor: number | null;
  /** Total de bugs en la base de datos, sin filtrar. */
  total: number;
  /** Bugs que cumplen la búsqueda y el filtro de tipo (igual a `total` si no hay ninguno). */
  matching: number;
}

/** Convierte los parámetros de una URL; los valores inválidos se rechazan con un error de zod. */
export function parsePageParams(searchParams: URLSearchParams): PageParams {
  return pageParamsSchema.parse({
    limit: searchParams.get("limit") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    kind: searchParams.get("kind") ?? undefined,
  });
}

/** Misma búsqueda que la de la base de datos, para el modo mock: juego, plataforma, texto o año. */
export function matchesQuery(bug: BugType, q: string): boolean {
  const query = q.toLowerCase();
  return (
    bug.game.toLowerCase().includes(query) ||
    bug.platform.toLowerCase().includes(query) ||
    bug.data.toLowerCase().includes(query) ||
    String(bug.bugYear) === query ||
    (kindsMatching(q) as string[]).includes(bug.kind)
  );
}

/** Pagina una lista ya ordenada del más reciente al más antiguo (modo mock). */
export function paginate(bugs: BugType[], { limit, cursor, q, kind }: PageParams): InsightsPage {
  const matching = bugs.filter(
    (bug) => (!q || matchesQuery(bug, q)) && (!kind || bug.kind === kind),
  );
  const after = cursor === undefined ? matching : matching.filter((bug) => bug.id < cursor);
  const items = after.slice(0, limit);
  return {
    items,
    nextCursor: after.length > limit ? items[items.length - 1].id : null,
    total: bugs.length,
    matching: matching.length,
  };
}
