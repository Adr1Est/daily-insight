import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getInsightById, getInsightsPage, getLatestInsights } from "@/lib/data";

describe("lib/data en modo mock", () => {
  beforeEach(() => vi.stubEnv("DATA_SOURCE", "mock"));
  afterEach(() => vi.unstubAllEnvs());

  it("pagina los 12 bugs de ejemplo del más reciente al más antiguo", async () => {
    const first = await getInsightsPage({ limit: 5 });
    expect(first.items.map((bug) => bug.id)).toEqual([12, 11, 10, 9, 8]);
    expect(first.nextCursor).toBe(8);
    expect(first.total).toBe(12);
    expect(first.matching).toBe(12);

    const second = await getInsightsPage({ limit: 5, cursor: 8 });
    expect(second.items.map((bug) => bug.id)).toEqual([7, 6, 5, 4, 3]);

    const last = await getInsightsPage({ limit: 5, cursor: 3 });
    expect(last.items.map((bug) => bug.id)).toEqual([2, 1]);
    expect(last.nextCursor).toBeNull();
  });

  it("busca y pagina los resultados, manteniendo el total del archivo", async () => {
    const page = await getInsightsPage({ limit: 2, q: "arcade" });
    expect(page.matching).toBe(3); // Space Invaders, Pac-Man, Donkey Kong
    expect(page.total).toBe(12);
    expect(page.items).toHaveLength(2);
    expect(page.nextCursor).not.toBeNull();
  });

  it("busca por año exacto", async () => {
    const page = await getInsightsPage({ limit: 24, q: "1996" });
    expect(page.items.map((bug) => bug.game).sort()).toEqual([
      "Pokémon Rojo y Azul",
      "Super Mario 64",
    ]);
  });

  it("devuelve un bug por id, o null si no existe", async () => {
    expect((await getInsightById(6))?.game).toBe("Pokémon Rojo y Azul");
    expect(await getInsightById(999)).toBeNull();
  });

  it("el primero de los recientes es el bug de hoy", async () => {
    const [today] = await getLatestInsights(1);
    const now = new Date();
    expect(today.day).toBe(now.getDate());
    expect(today.year).toBe(now.getFullYear());
  });
});
