import { z } from "zod";

/** Forma que se pide al modelo (salida estructurada). Sin restricciones extra para que el esquema sea compatible. */
export const agentOutputSchema = z.object({
  game: z.string().describe("Videojuego del bug. Si no es un juego, «no es un juego»."),
  platform: z.string().describe("Plataforma donde ocurrió. Ej.: Nintendo 64, Xbox, PS5, PC."),
  bugYear: z.number().int().describe("Año en que ocurrió el bug."),
  data: z.string().describe("Explicación detallada del bug en español, como máximo 10 líneas."),
});

/** Validación propia antes de guardar: lo que no cumpla no llega a la base de datos. */
export const insightSchema = z.strictObject({
  game: z.string().trim().min(1).max(120),
  platform: z.string().trim().min(1).max(120),
  bugYear: z
    .number()
    .int()
    .min(1950)
    .refine(year => year <= new Date().getFullYear(), { message: "El año del bug no puede ser futuro" }),
  data: z.string().trim().min(40).max(1500),
});

export type InsightInput = z.infer<typeof insightSchema>;
