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

/**
 * Protección CSRF de las escrituras públicas (votos): la petición debe venir de esta misma web.
 * Falla cerrado: sin `Origin` (o ilegible) o sin `Host`, no se acepta.
 */
export function isSameOrigin(origin: string | null, host: string | null): boolean {
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
