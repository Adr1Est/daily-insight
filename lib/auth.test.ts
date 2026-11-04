import { describe, expect, it } from "vitest";

import { MIN_SECRET_LENGTH, verifyBearer } from "@/lib/auth";

const SECRET = "s".repeat(MIN_SECRET_LENGTH);

describe("verifyBearer", () => {
  it("no autoriza si el secreto no está configurado (aunque llegue «Bearer undefined»)", () => {
    expect(verifyBearer("Bearer undefined", undefined)).toBe(false);
    expect(verifyBearer("Bearer ", "")).toBe(false);
  });

  it("no autoriza con un secreto demasiado corto", () => {
    const short = "corto";
    expect(verifyBearer(`Bearer ${short}`, short)).toBe(false);
  });

  it("no autoriza sin cabecera o con un token incorrecto", () => {
    expect(verifyBearer(null, SECRET)).toBe(false);
    expect(verifyBearer(`Bearer ${"x".repeat(MIN_SECRET_LENGTH)}`, SECRET)).toBe(false);
    expect(verifyBearer(SECRET, SECRET)).toBe(false);
  });

  it("autoriza con el token correcto", () => {
    expect(verifyBearer(`Bearer ${SECRET}`, SECRET)).toBe(true);
  });
});
