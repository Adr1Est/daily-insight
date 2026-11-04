import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAllInsights, getLatestInsights } from "@/lib/data";

describe("lib/data en modo mock", () => {
  beforeEach(() => vi.stubEnv("DATA_SOURCE", "mock"));
  afterEach(() => vi.unstubAllEnvs());

  it("devuelve los 12 bugs de ejemplo, del más reciente al más antiguo", async () => {
    const bugs = await getAllInsights();
    expect(bugs).toHaveLength(12);
    expect(bugs.map((bug) => bug.id)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
  });

  it("el primero es el bug de hoy", async () => {
    const [today] = await getLatestInsights(1);
    const now = new Date();
    expect(today.day).toBe(now.getDate());
    expect(today.year).toBe(now.getFullYear());
  });
});
