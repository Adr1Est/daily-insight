import { getAllInsights } from "@/lib/data";

// Los datos cambian una vez al día: se sirve desde caché y el cron la invalida al publicar.
export const revalidate = 3600;

export async function GET() {
  try {
    return Response.json(await getAllInsights());
  } catch (error) {
    console.error("[api/bugs]", error);
    return Response.json({ error: "No se pudieron cargar los bugs" }, { status: 500 });
  }
}
