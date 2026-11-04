import { describe, expect, it } from "vitest";

import { insightSchema } from "@/lib/insights/schema";

const valid = {
  game: "Pac-Man",
  platform: "Arcade",
  bugYear: 1980,
  data: "Al llegar al nivel 256 el contador se desborda y la mitad derecha del laberinto se llena de basura.",
};

describe("insightSchema", () => {
  it("acepta una salida válida", () => {
    expect(insightSchema.parse(valid)).toEqual(valid);
  });

  it("rechaza un año futuro o que no es un número entero", () => {
    expect(
      insightSchema.safeParse({ ...valid, bugYear: new Date().getFullYear() + 1 }).success,
    ).toBe(false);
    expect(insightSchema.safeParse({ ...valid, bugYear: Number.NaN }).success).toBe(false);
    expect(insightSchema.safeParse({ ...valid, bugYear: 1980.5 }).success).toBe(false);
  });

  it("rechaza textos vacíos o demasiado cortos", () => {
    expect(insightSchema.safeParse({ ...valid, game: "  " }).success).toBe(false);
    expect(insightSchema.safeParse({ ...valid, data: "Muy corto" }).success).toBe(false);
  });

  it("rechaza campos de más (por ejemplo, una fecha inventada por el modelo)", () => {
    expect(insightSchema.safeParse({ ...valid, day: 4 }).success).toBe(false);
  });
});
