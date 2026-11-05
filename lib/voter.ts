import "server-only";

import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";

// Votante anónimo: un id aleatorio por navegador, en una cookie httpOnly. No identifica a nadie;
// solo sirve para que cada navegador tenga un voto por bug y pueda cambiarlo o quitarlo.
export const VOTER_COOKIE = "daily-bug-voter";
const ONE_YEAR = 60 * 60 * 24 * 365;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** El id de la cookie si es un UUID válido; cualquier otro valor se ignora. */
export function parseVoterId(value: string | undefined): string | null {
  return value && UUID.test(value) ? value.toLowerCase() : null;
}

/** El votante de esta petición, o null si aún no ha votado nunca. */
export async function getVoterId(): Promise<string | null> {
  return parseVoterId((await cookies()).get(VOTER_COOKIE)?.value);
}

/** El votante de esta petición; si no tiene cookie (o no es válida), la crea. */
export async function ensureVoterId(): Promise<string> {
  const existing = await getVoterId();
  if (existing) return existing;

  const voterId = randomUUID();
  (await cookies()).set(VOTER_COOKIE, voterId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
  return voterId;
}
