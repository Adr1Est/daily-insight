import { describe, expect, it } from "vitest";

import { MAX_PAGE_SIZE, PAGE_SIZE, paginate, parsePageParams } from "@/lib/pagination";
import type { BugType } from "@/types/bug";

const parse = (query: string) => parsePageParams(new URLSearchParams(query));

describe("parsePageParams", () => {
  it("aplica los valores por defecto", () => {
    expect(parse("")).toEqual({
      limit: PAGE_SIZE,
      cursor: undefined,
      q: undefined,
      kind: undefined,
    });
  });

  it("acepta límite, cursor y búsqueda", () => {
    expect(parse("limit=10&cursor=120&q=%20mario%20")).toEqual({
      limit: 10,
      cursor: 120,
      q: "mario",
      kind: undefined,
    });
  });

  it("trata una búsqueda vacía como sin búsqueda", () => {
    expect(parse("q=%20%20").q).toBeUndefined();
  });

  it("rechaza límites fuera de rango, cursores inválidos y búsquedas demasiado largas", () => {
    expect(() => parse(`limit=${MAX_PAGE_SIZE + 1}`)).toThrow();
    expect(() => parse("limit=0")).toThrow();
    expect(() => parse("cursor=-3")).toThrow();
    expect(() => parse("cursor=abc")).toThrow();
    expect(() => parse(`q=${"x".repeat(101)}`)).toThrow();
  });
});

describe("filtro por tipo", () => {
  it("acepta un tipo conocido y rechaza uno desconocido", () => {
    expect(parse("kind=secreto").kind).toBe("secreto");
    expect(() => parse("kind=cortado")).toThrow();
  });

  it("pagina solo los del tipo pedido y lo combina con la búsqueda", () => {
    const bugs = [
      { id: 3, game: "Doom", platform: "PC", data: "x", bugYear: 1993, kind: "secreto" },
      { id: 2, game: "Doom II", platform: "PC", data: "x", bugYear: 1994, kind: "bug" },
      { id: 1, game: "Quake", platform: "PC", data: "x", bugYear: 1996, kind: "secreto" },
    ] as BugType[];
    const page = paginate(bugs, { limit: 1, kind: "secreto" });
    expect(page.items.map((b) => b.id)).toEqual([3]);
    expect(page).toMatchObject({ nextCursor: 3, total: 3, matching: 2 });
    expect(paginate(bugs, { limit: 5, kind: "secreto", q: "doom" }).matching).toBe(1);
  });
});
