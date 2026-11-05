import { describe, expect, it } from "vitest";

import { prefsInitScript, STORAGE_MOTION, STORAGE_TEXT_SIZE } from "@/lib/prefs";

const run = (storage: Record<string, string> | "blocked") => {
  const documentElement = { dataset: {} as Record<string, string> };
  const window =
    storage === "blocked"
      ? {
          get localStorage(): Storage {
            throw new Error("bloqueado");
          },
        }
      : { localStorage: { getItem: (key: string) => storage[key] ?? null } };
  new Function("window", "document", prefsInitScript())(window, { documentElement });
  return documentElement.dataset;
};

describe("prefsInitScript", () => {
  it("sin nada guardado, aplica los valores por defecto", () => {
    expect(run({})).toEqual({ motion: "auto", textSize: "normal" });
  });

  it("aplica lo guardado", () => {
    expect(run({ [STORAGE_MOTION]: "off", [STORAGE_TEXT_SIZE]: "xl" })).toEqual({
      motion: "off",
      textSize: "xl",
    });
  });

  it("ignora valores desconocidos", () => {
    expect(run({ [STORAGE_MOTION]: "rápido", [STORAGE_TEXT_SIZE]: "<script>" })).toEqual({
      motion: "auto",
      textSize: "normal",
    });
  });

  it("no rompe si el almacenamiento está bloqueado", () => {
    expect(run("blocked")).toEqual({ motion: "auto", textSize: "normal" });
  });
});
