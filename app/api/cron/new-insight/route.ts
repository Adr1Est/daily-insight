import { revalidatePath } from "next/cache";

import { verifyBearer } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { generateDailyInsight } from "@/lib/insights/generate";
import { isKind } from "@/lib/insights/kinds";

// Lo llama el workflow de GitHub Actions (.github/workflows/new-insight.yml) con `Authorization: Bearer ${INTERNAL_TOKEN}`.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  if (!verifyBearer(req.headers.get("authorization"), getEnv().INTERNAL_TOKEN)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // ?dryRun=1 genera y valida sin guardar, para revisar la calidad del prompt.
    // Con dryRun, ?kind=secreto (u otro tipo) fuerza el tipo para probar cada uno.
    const params = new URL(req.url).searchParams;
    const dryRun = params.get("dryRun") === "1";
    const requested = params.get("kind");
    if (requested !== null && (!dryRun || !isKind(requested))) {
      return Response.json({ error: "Tipo no válido (solo con dryRun=1)" }, { status: 400 });
    }
    const result = await generateDailyInsight({ dryRun, kind: requested ?? undefined });

    if (result.status === "preview") {
      return Response.json({
        status: result.status,
        insight: result.insight,
        release: result.release ?? null,
      });
    }

    if (result.status === "created") {
      revalidatePath("/");
      revalidatePath("/bugs");
      revalidatePath("/top");
      revalidatePath("/api/bugs");
    }

    return Response.json({ status: result.status, id: result.insight.id });
  } catch (error) {
    console.error("[cron/new-insight]", error);
    return Response.json({ error: "No se pudo generar la curiosidad del día" }, { status: 500 });
  }
}
