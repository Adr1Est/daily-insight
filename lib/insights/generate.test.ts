import { beforeEach, describe, expect, it, vi } from "vitest";

import { AI_MODEL } from "@/lib/insights/model";

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
  Agent: class {
    constructor(public config: Record<string, unknown>) {}
  },
  run: (...args: unknown[]) => run(...args),
}));

const {
  generateDailyInsight,
  buildPrompt,
  buildEventPrompt,
  insightAgent,
  INSTRUCTIONS,
  FOCUSES,
  normalizeTitle,
  pickKind,
} = await import("@/lib/insights/generate");

const NOW = new Date("2026-11-04T10:00:00Z");
const modelOutput = {
  kind: "bug" as const,
  game: "Super Mario Bros.",
  platform: "NES",
  bugYear: 1985,
  data: "Atravesando la pared del nivel 1-2 en el momento justo, las tuberías llevan al Mundo -1, un nivel acuático infinito.",
};

describe("insightAgent", () => {
  it("usa el modelo configurado con esfuerzo de razonamiento bajo", () => {
    const config = (insightAgent as unknown as { config: Record<string, unknown> }).config;
    expect(config.model).toBe(AI_MODEL);
    expect(config.modelSettings).toEqual({ reasoning: { effort: "low" } });
  });

  it("pide un título real y una explicación breve", () => {
    expect(INSTRUCTIONS).not.toContain("no es un juego");
    expect(INSTRUCTIONS).toContain("entre 250 y 500 caracteres");
  });

  it("explica los cinco tipos", () => {
    for (const kind of ["bug", "secreto", "desarrollo", "descartado", "localizacion"]) {
      expect(INSTRUCTIONS).toContain(`- ${kind}:`);
    }
  });
});

describe("generateDailyInsight", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.insight.findFirst.mockResolvedValue(null);
    prisma.insight.findMany.mockResolvedValue([]);
    prisma.insight.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 1, createdAt: NOW, ...data }),
    );
    run.mockResolvedValue({ finalOutput: modelOutput });
  });

  it("guarda la salida del modelo con la fecha calculada en el servidor", async () => {
    const result = await generateDailyInsight({ now: NOW, random: () => 0 });
    expect(result.status).toBe("created");
    expect(prisma.insight.create).toHaveBeenCalledWith({
      data: { ...modelOutput, day: 4, month: "Noviembre", year: 2026 },
    });
  });

  it("no genera nada si ya existe el bug de hoy", async () => {
    prisma.insight.findFirst.mockResolvedValue({ id: 7 });
    const result = await generateDailyInsight({ now: NOW, random: () => 0 });
    expect(result.status).toBe("skipped");
    expect(run).not.toHaveBeenCalled();
    expect(prisma.insight.create).not.toHaveBeenCalled();
  });

  it("no inserta nada si la salida del modelo no es válida", async () => {
    run.mockResolvedValue({ finalOutput: { ...modelOutput, bugYear: 3000 } });
    await expect(generateDailyInsight({ now: NOW, random: () => 0 })).rejects.toThrow();
    expect(prisma.insight.create).not.toHaveBeenCalled();
  });

  it("en modo prueba genera y valida sin comprobar el bug de hoy ni guardar", async () => {
    prisma.insight.findFirst.mockResolvedValue({ id: 7 });
    const result = await generateDailyInsight({ now: NOW, dryRun: true, random: () => 0 });
    expect(result).toEqual({
      status: "preview",
      insight: { ...modelOutput, day: 4, month: "Noviembre", year: 2026 },
    });
    expect(prisma.insight.findFirst).not.toHaveBeenCalled();
    expect(prisma.insight.create).not.toHaveBeenCalled();
  });

  it("pasa al modelo todo el historial de títulos y un enfoque al azar", async () => {
    prisma.insight.findMany.mockResolvedValue([
      { game: "Pac-Man" },
      { game: "no es un juego" },
      { game: "Doom" },
    ]);
    await generateDailyInsight({ now: NOW, random: () => 0 });
    const prompt = run.mock.calls[0][1] as string;
    expect(prompt).toContain("Pac-Man; Doom");
    expect(prompt).not.toContain("no es un juego");
    expect(prompt).toContain(FOCUSES[0]);
  });

  it("si propone un juego ya publicado, lo vuelve a intentar indicando cuál evitar", async () => {
    prisma.insight.findMany.mockResolvedValue([{ game: "Super Mario Bros." }]);
    run.mockResolvedValueOnce({ finalOutput: modelOutput }).mockResolvedValueOnce({
      finalOutput: { ...modelOutput, game: "Metroid", platform: "NES", bugYear: 1986 },
    });
    const result = await generateDailyInsight({ now: NOW, random: () => 0 });
    expect(run).toHaveBeenCalledTimes(2);
    expect(run.mock.calls[1][1]).toContain("Ya propusiste «Super Mario Bros.»");
    expect(result.insight.game).toBe("Metroid");
  });

  it("un juego ya publicado con otro tipo no cuenta como repetido", async () => {
    prisma.insight.findMany.mockResolvedValue([
      { game: "Super Mario Bros.", kind: "secreto", data: "x" },
    ]);
    const result = await generateDailyInsight({ now: NOW, random: () => 0 });
    expect(run).toHaveBeenCalledTimes(1);
    expect(result.insight.game).toBe("Super Mario Bros.");
  });

  it("el tipo lo decide el servidor aunque el modelo devuelva otro", async () => {
    run.mockResolvedValue({ finalOutput: { ...modelOutput, kind: "desarrollo" } });
    await generateDailyInsight({ now: NOW, kind: "secreto" });
    expect(run.mock.calls[0][1]).toContain("Tipo de hoy: secreto.");
    expect(prisma.insight.create.mock.calls[0][0].data.kind).toBe("secreto");
  });

  it("en un día del calendario el tema es ese juego y el modelo elige el tipo", async () => {
    prisma.insight.findMany.mockResolvedValue([
      { game: "Super Mario Bros.", kind: "bug", data: "El Mundo -1 de siempre." },
    ]);
    run
      .mockResolvedValueOnce({ finalOutput: modelOutput }) // bug: ya publicado de este juego
      .mockResolvedValueOnce({ finalOutput: { ...modelOutput, kind: "secreto" } });
    const releases = [{ date: "11-04", game: "Super Mario Bros.", platform: "NES", year: 1985 }];
    const result = await generateDailyInsight({ now: NOW, releases, kind: "localizacion" });
    const first = run.mock.calls[0][1] as string;
    expect(first).toContain("aniversario de Super Mario Bros.");
    expect(first).toContain("(bug) El Mundo -1 de siempre.");
    expect(run.mock.calls[1][1]).toContain("Ya hay una curiosidad de tipo bug");
    expect(result.insight).toMatchObject({ game: "Super Mario Bros.", kind: "secreto" });
  });

  it("guarda en el bug el lanzamiento del calendario que lo motivó", async () => {
    const releases = [{ date: "11-04", game: "Super Mario Bros.", platform: "NES", year: 1985 }];
    await generateDailyInsight({ now: NOW, releases });
    expect(prisma.insight.create.mock.calls[0][0].data).toMatchObject({
      releaseGame: "Super Mario Bros.",
      releasePlatform: "NES",
      releaseYear: 1985,
    });
  });

  it("sin lanzamiento no guarda campos de calendario", async () => {
    await generateDailyInsight({ now: NOW, random: () => 0, releases: [] });
    expect(prisma.insight.create.mock.calls[0][0].data).not.toHaveProperty("releaseGame");
  });

  it("tras 3 intentos repetidos publica igualmente (no deja el día sin bug)", async () => {
    prisma.insight.findMany.mockResolvedValue([{ game: "Super Mario Bros." }]);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await generateDailyInsight({ now: NOW, random: () => 0 });
    expect(run).toHaveBeenCalledTimes(3);
    expect(result.status).toBe("created");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("buildPrompt", () => {
  it("incluye el tipo, los títulos usados, el enfoque y los rechazados", () => {
    const prompt = buildPrompt({
      kind: "descartado",
      usedGames: ["Pac-Man", "Doom"],
      focus: "un juego de móvil",
      rejected: ["Tetris"],
    });
    expect(prompt).toContain("Tipo de hoy: descartado.");
    expect(prompt).toContain("con este tipo; no uses ninguno:\nPac-Man; Doom");
    expect(prompt).toContain("un juego de móvil");
    expect(prompt).toContain("Ya propusiste «Tetris»");
  });

  it("sin historial no incluye la lista de usados", () => {
    expect(buildPrompt({ kind: "bug", usedGames: [], focus: "un juego de móvil" })).not.toContain(
      "ya publicados",
    );
  });
});

describe("buildEventPrompt", () => {
  const release = { date: "2026-11-19", game: "Juego nuevo", platform: "PS5", year: 2026 };

  it("en un lanzamiento de hoy prohíbe inventar detalles del juego final", () => {
    const prompt = buildEventPrompt({ release, isNew: true, previous: [] });
    expect(prompt).toContain("Hoy sale Juego nuevo (PS5).");
    expect(prompt).toContain("nunca de detalles del juego final");
  });

  it("en un lanzamiento pide el título del juego del que se habla, no el del estreno", () => {
    const prompt = buildEventPrompt({ release, isNew: true, previous: [] });
    expect(prompt).toContain("«Juego nuevo» solo si hablas del nuevo lanzamiento");
    expect(prompt).toContain("sin añadidos como «remake»");
  });

  it("en un aniversario pide una curiosidad del juego", () => {
    const old = { ...release, year: 1998 };
    const prompt = buildEventPrompt({ release: old, isNew: false, previous: [] });
    expect(prompt).toContain("aniversario de Juego nuevo (PS5, 1998)");
  });
});

describe("pickKind", () => {
  it("reparte los cinco tipos por igual", () => {
    expect([0, 0.2, 0.4, 0.6, 0.8, 0.999].map((r) => pickKind(() => r))).toEqual([
      "bug",
      "secreto",
      "desarrollo",
      "descartado",
      "localizacion",
      "localizacion",
    ]);
  });
});

describe("normalizeTitle", () => {
  it("ignora mayúsculas, tildes y signos", () => {
    expect(normalizeTitle("Pokémon Rojo/Azul")).toBe(normalizeTitle("pokemon rojo azul"));
    expect(normalizeTitle("Super Mario Bros.")).toBe(normalizeTitle("Super Mario Bros"));
  });
});
