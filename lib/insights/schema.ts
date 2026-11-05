import { z } from "zod";

import { KIND_IDS } from "@/lib/insights/kinds";

/** Forma que se pide al modelo (salida estructurada). Sin restricciones extra para que el esquema sea compatible. */
export const agentOutputSchema = z.object({
  kind: z
    .enum(KIND_IDS)
    .describe("Tipo de curiosidad: bug, secreto, desarrollo, descartado o localizacion."),
  game: z
    .string()
    .describe(
      "Título oficial del juego en España, o nombre del producto si es hardware o un servicio.",
    ),
  platform: z
    .string()
    .describe(
      "Plataforma o plataformas del juego o de la versión, separadas por comas (máximo 3).",
    ),
  bugYear: z
    .number()
    .int()
    .describe("Año del hecho: cuando el fallo, el secreto o la versión llegó al público."),
  data: z
    .string()
    .describe(
      "Explicación breve en español de España: 2 a 4 frases, 250 a 500 caracteres, texto plano.",
    ),
});

/** Validación propia antes de guardar: lo que no cumpla no llega a la base de datos. */
export const insightSchema = z.strictObject({
  kind: z.enum(KIND_IDS),
  game: z.string().trim().min(1).max(120),
  platform: z.string().trim().min(1).max(120),
  bugYear: z
    .number()
    .int()
    .min(1950)
    .refine((year) => year <= new Date().getFullYear(), {
      message: "El año no puede ser futuro",
    }),
  data: z.string().trim().min(40).max(1500),
});

export type InsightInput = z.infer<typeof insightSchema>;
