import { describe, expect, it } from "vitest";

import { parseVoterId } from "@/lib/voter";

describe("parseVoterId", () => {
  it("acepta un UUID y lo normaliza a minúsculas", () => {
    expect(parseVoterId("0F8FAD5B-D9CB-469F-A165-70867728950E")).toBe(
      "0f8fad5b-d9cb-469f-a165-70867728950e",
    );
  });

  it("ignora la cookie ausente o manipulada", () => {
    for (const value of [undefined, "", "abc", "'; DROP TABLE x; --", "0f8fad5b-d9cb-469f-a165"]) {
      expect(parseVoterId(value)).toBeNull();
    }
  });
});
