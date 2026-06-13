import { describe, expect, it } from "vitest";
import type { CharacterResponse } from "@/services/api/schemas/character";
import { createEnemyRoster } from "./createEnemyRoster";

const stats = { power: 1, intelligence: 1, defense: 1, health: 5 };
const pool: CharacterResponse[] = [
  { type: "IRIS", superpower: "LIGHT", stats },
  { type: "ZEPHYR", superpower: "AIR", stats },
  { type: "WENDY", superpower: "WATER", stats },
  { type: "SKYE", superpower: "GRASS", stats },
];

describe("createEnemyRoster", () => {
  describe("when the pool has enough spare characters", () => {
    it("picks only characters the player did not take", () => {
      const roster = createEnemyRoster(pool, ["IRIS"], 2);

      expect(roster.map((character) => character.type)).toEqual([
        "ZEPHYR",
        "WENDY",
      ]);
    });
  });

  describe("when the leftovers cannot fill the roster", () => {
    it("falls back to reusing characters the player took", () => {
      const roster = createEnemyRoster(pool, ["IRIS", "ZEPHYR", "WENDY"], 2);

      expect(roster.map((character) => character.type)).toEqual([
        "SKYE",
        "IRIS",
      ]);
    });
  });

  describe("when called twice with the same input", () => {
    it("returns the same roster (deterministic)", () => {
      const first = createEnemyRoster(pool, ["IRIS"], 3);
      const second = createEnemyRoster(pool, ["IRIS"], 3);

      expect(first).toEqual(second);
    });
  });
});
