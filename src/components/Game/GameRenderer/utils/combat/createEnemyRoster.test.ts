import { describe, expect, it } from "vitest";
import type { GameCharacter } from "../../GameRenderer.types";
import { createEnemyRoster } from "./createEnemyRoster";

const pool: GameCharacter[] = ["a", "b", "c", "d"].map((id) => ({
  id,
  name: id.toUpperCase(),
  stats: { power: 1, speed: 1, defense: 1 },
}));

describe("createEnemyRoster", () => {
  describe("when the pool has enough spare characters", () => {
    it("picks only characters the player did not take", () => {
      const roster = createEnemyRoster(pool, ["a"], 2);

      expect(roster.map((character) => character.id)).toEqual(["b", "c"]);
    });
  });

  describe("when the leftovers cannot fill the roster", () => {
    it("falls back to reusing characters the player took", () => {
      const roster = createEnemyRoster(pool, ["a", "b", "c"], 2);

      expect(roster.map((character) => character.id)).toEqual(["d", "a"]);
    });
  });

  describe("when called twice with the same input", () => {
    it("returns the same roster (deterministic)", () => {
      const first = createEnemyRoster(pool, ["a"], 3);
      const second = createEnemyRoster(pool, ["a"], 3);

      expect(first).toEqual(second);
    });
  });
});
