import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = {
  insight: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  },
};
const run = vi.fn();

vi.mock("@/lib/db", () => ({ getPrisma: () => prisma }));
vi.mock("@openai/agents", () => ({
  Agent: class { constructor(public config: unknown) {} },
  run: (...args: unknown[]) => run(...args),
}));

const { generateDailyInsight, buildPrompt } = await import("@/lib/insights/generate");

const NOW = new Date("2026-11-04T10:00:00Z");
const modelOutput = {
  game: "Super Mario Bros.",
  platform: "NES",
  bugYear: 1985,
  data: "Atravesando la pared del nivel 1-2 en el momento justo, las tuberías llevan al Mundo -1, un nivel acuático infinito.",
};

describe("generateDailyInsight", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.insight.findFirst.mockResolvedValue(null);
    prisma.insight.findMany.mockResolvedValue([]);
    prisma.insight.create.mockImplementation(({ data }) => Promise.resolve({ id: 1, createdAt: NOW, ...data }));
    run.mockResolvedValue({ finalOutput: modelOutput });
  });

  it("guarda la salida del modelo con la fecha calculada en el servidor", async () => {
    const result = await generateDailyInsight(NOW);
    expect(result.status).toBe("created");
    expect(prisma.insight.create).toHaveBeenCalledWith({
      data: { ...modelOutput, day: 4, month: "Noviembre", year: 2026 },
    });
  });

  it("no genera nada si ya existe el bug de hoy", async () => {
    prisma.insight.findFirst.mockResolvedValue({ id: 7 });
    const result = await generateDailyInsight(NOW);
    expect(result.status).toBe("skipped");
    expect(run).not.toHaveBeenCalled();
    expect(prisma.insight.create).not.toHaveBeenCalled();
  });

  it("no inserta nada si la salida del modelo no es válida", async () => {
    run.mockResolvedValue({ finalOutput: { ...modelOutput, bugYear: 3000 } });
    await expect(generateDailyInsight(NOW)).rejects.toThrow();
    expect(prisma.insight.create).not.toHaveBeenCalled();
  });

  it("incluye los bugs anteriores en el prompt para no repetirlos", () => {
    const prompt = buildPrompt([{ game: "Pac-Man", data: "Nivel 256" }]);
    expect(prompt).toContain("1. Pac-Man: Nivel 256");
  });
});
