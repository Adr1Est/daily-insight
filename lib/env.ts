import "server-only";

import { z } from "zod";

// Variables de entorno del servidor, validadas. Se leen bajo demanda (no al importar)
// para que el modo mock y el build funcionen sin las variables de la BD o de OpenAI.
const envSchema = z.object({
  DATA_SOURCE: z.enum(["api", "mock"]).default("api"),
  DATABASE_URL: z.string().min(1).optional(),
  INTERNAL_TOKEN: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof envSchema>;

export function getEnv(): ServerEnv {
  return envSchema.parse(process.env);
}
