import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  castVote,
  forgetVoter,
  getMyVotes,
  getVoteState,
  voteBodySchema,
  voteDelta,
  type VoteValue,
} from "@/lib/votes";

describe("voteDelta", () => {
  it.each<[VoteValue, VoteValue, number]>([
    [0, 1, 1],
    [0, -1, -1],
    [1, 0, -1],
    [-1, 0, 1],
    [1, -1, -2],
    [-1, 1, 2],
    [1, 1, 0],
  ])("de %i a %i cambia la puntuación en %i", (previous, next, delta) => {
    expect(voteDelta(previous, next)).toBe(delta);
  });
});

describe("voteBodySchema", () => {
  it("acepta 1, -1 y 0", () => {
    for (const value of [1, -1, 0]) expect(voteBodySchema.safeParse({ value }).success).toBe(true);
  });

  it("rechaza cualquier otro valor", () => {
    for (const body of [{ value: 2 }, { value: "1" }, { value: 0.5 }, {}, null]) {
      expect(voteBodySchema.safeParse(body).success).toBe(false);
    }
  });
});

describe("votos en modo mock", () => {
  beforeEach(() => vi.stubEnv("DATA_SOURCE", "mock"));
  afterEach(() => vi.unstubAllEnvs());

  it("un voto por navegador: se puede cambiar y quitar sin descuadrar la puntuación", async () => {
    const id = 1;
    const voter = "00000000-0000-4000-8000-000000000001";
    const start = (await getVoteState(id, voter))!;
    expect(start.myVote).toBe(0);

    expect(await castVote(id, voter, 1)).toEqual({ score: start.score + 1, myVote: 1 });
    expect(await castVote(id, voter, 1)).toEqual({ score: start.score + 1, myVote: 1 });
    expect(await castVote(id, voter, -1)).toEqual({ score: start.score - 1, myVote: -1 });
    expect(await castVote(id, voter, 0)).toEqual({ score: start.score, myVote: 0 });
  });

  it("los votos de navegadores distintos se suman", async () => {
    const id = 2;
    const { score } = (await getVoteState(id, null))!;
    await castVote(id, "00000000-0000-4000-8000-00000000000a", 1);
    await castVote(id, "00000000-0000-4000-8000-00000000000b", 1);
    expect(await getVoteState(id, null)).toEqual({ score: score + 2, myVote: 0 });
  });

  it("devuelve null si el bug no existe", async () => {
    expect(await getVoteState(999, null)).toBeNull();
    expect(await castVote(999, "00000000-0000-4000-8000-000000000001", 1)).toBeNull();
  });

  it("lista los votos de un navegador, el último primero", async () => {
    const voter = "00000000-0000-4000-8000-0000000000c1";
    await castVote(3, voter, 1);
    await castVote(4, voter, -1);
    await castVote(5, voter, 1);
    await castVote(5, voter, 0); // quitado: no aparece
    const mine = await getMyVotes(voter);
    expect(mine.map(({ id, value }) => [id, value])).toEqual([
      [4, -1],
      [3, 1],
    ]);
    expect(mine[0].game).toBe("Super Mario Bros.");
  });

  it("olvidar los votos deja las puntuaciones como estaban y no toca a otros navegadores", async () => {
    const me = "00000000-0000-4000-8000-0000000000d1";
    const other = "00000000-0000-4000-8000-0000000000d2";
    const before6 = (await getVoteState(6, null))!.score;
    const before7 = (await getVoteState(7, null))!.score;

    await castVote(6, me, 1);
    await castVote(7, me, -1);
    await castVote(6, other, 1);

    expect(await forgetVoter(me)).toBe(2);
    expect((await getVoteState(6, null))!.score).toBe(before6 + 1); // queda el voto del otro
    expect((await getVoteState(7, null))!.score).toBe(before7);
    expect(await getMyVotes(me)).toEqual([]);
    expect(await getVoteState(6, other)).toMatchObject({ myVote: 1 });
    expect(await forgetVoter(me)).toBe(0);
  });
});
