import { describe, expect, it } from "vitest";

import { findRelease, isNewRelease, madridIsoDate, type Release } from "@/lib/insights/calendar";

const releases: Release[] = [
  { date: "09-13", game: "Super Mario Bros.", platform: "NES", year: 1985 },
  { date: "2026-09-13", game: "Juego nuevo", platform: "PS5", year: 2026 },
  { date: "02-29", game: "Bisiesto", platform: "PC", year: 2000 },
  { date: "mal", game: "Fecha rota", platform: "PC", year: 2000 },
];

describe("calendario de lanzamientos", () => {
  it("usa la fecha de Madrid (a medianoche ya es el día siguiente)", () => {
    expect(madridIsoDate(new Date("2026-09-12T22:30:00Z"))).toBe("2026-09-13");
  });

  it("un aniversario se repite cada año", () => {
    expect(findRelease(new Date("2031-09-13T10:00:00Z"), releases)?.game).toBe("Super Mario Bros.");
  });

  it("una fecha completa gana al aniversario del mismo día", () => {
    expect(findRelease(new Date("2026-09-13T10:00:00Z"), releases)?.game).toBe("Juego nuevo");
  });

  it("sin coincidencia no hay evento; las fechas mal escritas se ignoran", () => {
    expect(findRelease(new Date("2026-03-01T10:00:00Z"), releases)).toBeNull();
  });

  it("el 29 de febrero solo existe en años bisiestos", () => {
    expect(findRelease(new Date("2028-02-29T10:00:00Z"), releases)?.game).toBe("Bisiesto");
    expect(findRelease(new Date("2027-02-28T10:00:00Z"), releases)).toBeNull();
  });

  it("distingue un lanzamiento de este año de un aniversario", () => {
    const now = new Date("2026-09-13T10:00:00Z");
    expect(isNewRelease(releases[1], now)).toBe(true);
    expect(isNewRelease(releases[0], now)).toBe(false);
  });
});
