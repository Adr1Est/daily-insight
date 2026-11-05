import { describe, expect, it } from "vitest";

import { isKind, kindLabel, kindsMatching } from "@/lib/insights/kinds";
import { matchesQuery } from "@/lib/pagination";
import type { BugType } from "@/types/bug";

describe("tipos de curiosidad", () => {
  it("rótulo de la pegatina; un tipo desconocido cuenta como bug", () => {
    expect(kindLabel("descartado")).toBe("Descartado");
    expect(kindLabel("localizacion")).toBe("Localización");
    expect(kindLabel("inventado")).toBe("Bug");
    expect(isKind("secreto")).toBe(true);
    expect(isKind("cortado")).toBe(false);
  });

  it("la búsqueda encuentra tipos sin distinguir mayúsculas ni tildes", () => {
    expect(kindsMatching("LOCALIZACION")).toEqual(["localizacion"]);
    expect(kindsMatching("secre")).toEqual(["secreto"]);
    expect(kindsMatching("  ")).toEqual([]);
  });

  it("el buscador del modo mock también filtra por tipo", () => {
    const bug = { game: "Doom", platform: "PC", data: "Texto", bugYear: 1993, kind: "secreto" };
    expect(matchesQuery(bug as BugType, "secreto")).toBe(true);
    expect(matchesQuery(bug as BugType, "descartado")).toBe(false);
  });
});
