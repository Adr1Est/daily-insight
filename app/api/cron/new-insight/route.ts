import { revalidatePath } from "next/cache";

import { verifyBearer } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { generateDailyInsight } from "@/lib/insights/generate";

// Lo llama el cron de Vercel (vercel.json) con `Authorization: Bearer ${CRON_SECRET}`.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  if (!verifyBearer(req.headers.get("authorization"), getEnv().CRON_SECRET)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // ?dryRun=1 genera y valida sin guardar, para revisar la calidad del prompt.
    const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";
    const result = await generateDailyInsight({ dryRun });

    if (result.status === "preview") {
      return Response.json({ status: result.status, insight: result.insight });
    }

    if (result.status === "created") {
      revalidatePath("/");
      revalidatePath("/bugs");
      revalidatePath("/api/bugs");
    }

    return Response.json({ status: result.status, id: result.insight.id });
  } catch (error) {
    console.error("[cron/new-insight]", error);
    return Response.json({ error: "No se pudo generar el bug del día" }, { status: 500 });
  }
}
