import { describe, expect, it } from "vitest";

import {
  engine,
  STORAGE_SEEN,
  STORAGE_THEME,
  themeCss,
  themeInitScript,
  THEMES,
  type ThemeTokens,
} from "@/lib/themes";

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

describe("disponibilidad de temas de temporada", () => {
  it.each([
    ["halloween", day(2026, 9, 30), false],
    ["halloween", day(2026, 10, 1), true],
    ["halloween", day(2026, 11, 1), true],
    ["halloween", day(2026, 11, 2), false],
    ["navidad", day(2026, 10, 31), false],
    ["navidad", day(2026, 11, 1), true],
    ["navidad", day(2026, 12, 31), true],
    ["navidad", day(2027, 1, 9), true],
    ["navidad", day(2027, 1, 10), false],
  ])("%s el %s → %s", (id, date, expected) => {
    expect(engine.isAvailable(id, date)).toBe(expected);
  });

  it("los temas fijos están siempre disponibles", () => {
    for (const date of [day(2026, 3, 15), day(2026, 10, 15), day(2026, 12, 25)]) {
      expect(engine.available(date)).toEqual(expect.arrayContaining(["videoclub", "neon", "lcd"]));
    }
  });

  it("la Navidad de enero pertenece a la temporada del año anterior", () => {
    expect(engine.seasonKey("navidad", day(2027, 1, 5))).toBe("navidad-2026");
    expect(engine.seasonKey("navidad", day(2026, 12, 5))).toBe("navidad-2026");
  });
});

describe("resolveTheme", () => {
  it("aplica el tema de temporada la primera vez y lo marca como visto", () => {
    expect(engine.resolve({ stored: "neon", seen: [], date: day(2026, 10, 15) })).toEqual({
      theme: "halloween",
      seen: ["halloween-2026"],
    });
  });

  it("si la temporada ya se vio, respeta la elección del usuario", () => {
    expect(
      engine.resolve({ stored: "neon", seen: ["halloween-2026"], date: day(2026, 10, 20) }).theme,
    ).toBe("neon");
  });

  it("vuelve al tema por defecto cuando el tema guardado ha caducado", () => {
    expect(
      engine.resolve({ stored: "halloween", seen: ["halloween-2026"], date: day(2026, 11, 2) })
        .theme,
    ).toBe("navidad"); // primera visita de la temporada de Navidad
    expect(
      engine.resolve({
        stored: "halloween",
        seen: ["halloween-2026", "navidad-2026"],
        date: day(2026, 11, 2),
      }).theme,
    ).toBe("videoclub");
  });

  it("el 1 de noviembre gana la temporada que acaba de empezar (Navidad)", () => {
    expect(
      engine.resolve({ stored: null, seen: ["halloween-2026"], date: day(2026, 11, 1) }).theme,
    ).toBe("navidad");
  });

  it("ignora un tema guardado desconocido", () => {
    expect(engine.resolve({ stored: "inventado", seen: [], date: day(2026, 3, 1) }).theme).toBe(
      "videoclub",
    );
  });
});

describe("themeInitScript", () => {
  const runScript = (date: Date, storage: Record<string, string>) => {
    const store = new Map(Object.entries(storage));
    const localStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    };
    const documentElement = { dataset: {} as Record<string, string> };
    const FakeDate = class extends Date {
      constructor(...args: []) {
        super(...((args.length ? args : [date.getTime()]) as []));
      }
    };
    new Function("window", "document", "Date", themeInitScript())(
      { localStorage },
      { documentElement },
      FakeDate,
    );
    return { theme: documentElement.dataset.theme, store };
  };

  it("da el mismo resultado que el motor y lo guarda", () => {
    const { theme, store } = runScript(day(2026, 10, 15), { [STORAGE_THEME]: "neon" });
    expect(theme).toBe("halloween");
    expect(store.get(STORAGE_THEME)).toBe("halloween");
    expect(JSON.parse(store.get(STORAGE_SEEN) ?? "[]")).toEqual(["halloween-2026"]);
  });

  it("respeta la elección guardada fuera de temporada", () => {
    expect(runScript(day(2026, 3, 1), { [STORAGE_THEME]: "lcd" }).theme).toBe("lcd");
  });

  it("no rompe si el almacenamiento está corrupto", () => {
    expect(runScript(day(2026, 3, 1), { [STORAGE_SEEN]: "{no-json" }).theme).toBe("videoclub");
  });
});

describe("paletas", () => {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: string, b: string) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  const pairs: [keyof ThemeTokens, keyof ThemeTokens][] = [
    ["card-ink", "card"],
    ["card-ink-soft", "card"],
    ["wall-ink", "wall"],
    ["wall-ink-soft", "wall"],
    ["wall-ink", "spine"],
    ["highlight", "spine"],
    ["on-highlight", "highlight"],
    ["on-sticker", "sticker"],
  ];

  for (const theme of THEMES) {
    it.each(pairs)(`${theme.name}: %s sobre %s cumple AA (4.5:1)`, (fg, bg) => {
      expect(contrast(theme.tokens[fg], theme.tokens[bg])).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("genera un bloque CSS por tema, con el primero como valor por defecto", () => {
    const css = themeCss();
    expect(css).toContain(':root,:root[data-theme="videoclub"]{');
    for (const theme of THEMES) expect(css).toContain(`[data-theme="${theme.id}"]`);
    expect(css).not.toContain("</style");
  });
});
