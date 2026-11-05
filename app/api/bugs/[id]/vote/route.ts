import { isSameOrigin } from "@/lib/auth";
import { ensureVoterId, getVoterId } from "@/lib/voter";
import { castVote, getVoteState, voteBodySchema } from "@/lib/votes";

// Depende de la cookie del votante: nunca se cachea en la CDN.
const NO_STORE = { "Cache-Control": "private, no-store" };

type Context = { params: Promise<{ id: string }> };

async function parseId({ params }: Context): Promise<number | null> {
  const { id } = await params;
  return /^\d{1,9}$/.test(id) ? Number(id) : null;
}

const invalidId = () =>
  Response.json({ error: "Identificador no válido" }, { status: 400, headers: NO_STORE });
const notFound = () =>
  Response.json({ error: "Bug no encontrado" }, { status: 404, headers: NO_STORE });

/** GET /api/bugs/:id/vote → { score, myVote }: puntuación del bug y voto de este navegador. */
export async function GET(_req: Request, context: Context) {
  const id = await parseId(context);
  if (id === null) return invalidId();

  try {
    const state = await getVoteState(id, await getVoterId());
    if (!state) return notFound();
    return Response.json(state, { headers: NO_STORE });
  } catch (error) {
    console.error("[api/bugs/:id/vote GET]", error);
    return Response.json({ error: "No se pudo cargar la valoración" }, { status: 500 });
  }
}

/** POST /api/bugs/:id/vote { value: 1 | -1 | 0 } → { score, myVote }. 0 quita el voto. */
export async function POST(req: Request, context: Context) {
  if (!isSameOrigin(req.headers.get("origin"), req.headers.get("host"))) {
    return Response.json({ error: "Origen no permitido" }, { status: 403, headers: NO_STORE });
  }

  const id = await parseId(context);
  if (id === null) return invalidId();

  const body = voteBodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return Response.json({ error: "Voto no válido" }, { status: 400, headers: NO_STORE });
  }

  try {
    const state = await castVote(id, await ensureVoterId(), body.data.value);
    if (!state) return notFound();
    return Response.json(state, { headers: NO_STORE });
  } catch (error) {
    console.error("[api/bugs/:id/vote POST]", error);
    return Response.json({ error: "No se pudo guardar el voto" }, { status: 500 });
  }
}
