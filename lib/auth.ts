import "server-only";

import { timingSafeEqual } from "node:crypto";

export const MIN_SECRET_LENGTH = 32;

/**
 * Comprueba la cabecera `Authorization: Bearer <secreto>` en tiempo constante.
 * Falla cerrado: sin secreto configurado, o con uno demasiado corto, no autoriza nunca.
 */
export function verifyBearer(authorization: string | null, secret: string | undefined): boolean {
  if (!secret || secret.length < MIN_SECRET_LENGTH || !authorization) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authorization);
  return received.length === expected.length && timingSafeEqual(received, expected);
}
