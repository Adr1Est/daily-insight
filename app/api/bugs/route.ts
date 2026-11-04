import { ZodError } from "zod";

import { getInsightsPage } from "@/lib/data";
import { parsePageParams } from "@/lib/pagination";

// Respuestas cacheadas en la CDN por URL (página + búsqueda): muchos visitantes con la misma
// consulta no llegan a la base de datos. Los datos cambian una vez al día.
const CACHE = "public, s-maxage=300, stale-while-revalidate=3600";

/**
 * GET /api/bugs?limit=24&cursor=<id>&q=<búsqueda>
 * → { items, nextCursor, total (todos los bugs de la BD), matching (los que cumplen la búsqueda) }
 */
export async function GET(req: Request) {
  let params;
  try {
    params = parsePageParams(new URL(req.url).searchParams);
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: "Parámetros de paginación no válidos" }, { status: 400 });
    }
    throw error;
  }

  try {
    return Response.json(await getInsightsPage(params), { headers: { "Cache-Control": CACHE } });
  } catch (error) {
    console.error("[api/bugs]", error);
    return Response.json({ error: "No se pudieron cargar los bugs" }, { status: 500 });
  }
}
