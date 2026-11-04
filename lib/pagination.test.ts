import { describe, expect, it } from "vitest";

import { MAX_PAGE_SIZE, PAGE_SIZE, parsePageParams } from "@/lib/pagination";

const parse = (query: string) => parsePageParams(new URLSearchParams(query));

describe("parsePageParams", () => {
  it("aplica los valores por defecto", () => {
    expect(parse("")).toEqual({ limit: PAGE_SIZE, cursor: undefined, q: undefined });
  });

  it("acepta límite, cursor y búsqueda", () => {
    expect(parse("limit=10&cursor=120&q=%20mario%20")).toEqual({
      limit: 10,
      cursor: 120,
      q: "mario",
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
