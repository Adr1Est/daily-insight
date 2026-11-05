import { isSameOrigin } from "@/lib/auth";
import { forgetVoterCookie, getVoterId } from "@/lib/voter";
import { forgetVoter, getMyVotes } from "@/lib/votes";

// Depende de la cookie del votante: nunca se cachea en la CDN.
const NO_STORE = { "Cache-Control": "private, no-store" };

/** GET /api/votes → { votes }: los votos de este navegador, del más reciente al más antiguo. */
export async function GET() {
  try {
    const voterId = await getVoterId();
    const votes = voterId ? await getMyVotes(voterId) : [];
    return Response.json({ votes }, { headers: NO_STORE });
  } catch (error) {
    console.error("[api/votes GET]", error);
    return Response.json({ error: "No se pudieron cargar tus votos" }, { status: 500 });
  }
}

/** DELETE /api/votes → { deleted }: borra los votos de este navegador y su cookie. */
export async function DELETE(req: Request) {
  if (!isSameOrigin(req.headers.get("origin"), req.headers.get("host"))) {
    return Response.json({ error: "Origen no permitido" }, { status: 403, headers: NO_STORE });
  }

  try {
    const voterId = await getVoterId();
    const deleted = voterId ? await forgetVoter(voterId) : 0;
    await forgetVoterCookie();
    return Response.json({ deleted }, { headers: NO_STORE });
  } catch (error) {
    console.error("[api/votes DELETE]", error);
    return Response.json({ error: "No se pudieron borrar tus votos" }, { status: 500 });
  }
}
