import { getInsightById } from "@/lib/data";

const CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";

/** GET /api/bugs/:id → un bug concreto (para abrir /bugs#bug-N aunque no esté en la página cargada). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) {
    return Response.json({ error: "Identificador no válido" }, { status: 400 });
  }

  try {
    const bug = await getInsightById(Number(id));
    if (!bug) return Response.json({ error: "Bug no encontrado" }, { status: 404 });
    return Response.json(bug, { headers: { "Cache-Control": CACHE } });
  } catch (error) {
    console.error("[api/bugs/:id]", error);
    return Response.json({ error: "No se pudo cargar el bug" }, { status: 500 });
  }
}
