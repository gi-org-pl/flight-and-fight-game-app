import { describe, expect, it } from "vitest";
import type { Fighter } from "../../GameRenderer.types";
import { chooseEnemyTarget } from "./chooseEnemyTarget";

const fighter = (health: number): Fighter => ({
  id: "x",
  name: "X",
  stats: { power: 1, speed: 1, defense: 1 },
  maxHealth: 10,
  health,
});

describe("chooseEnemyTarget", () => {
  describe("when several fighters are alive", () => {
    it("targets the one with the lowest health", () => {
      expect(chooseEnemyTarget([fighter(8), fighter(2), fighter(5)])).toBe(1);
    });
  });

  describe("when the weakest fighter is already down", () => {
    it("ignores dead fighters and picks the weakest living one", () => {
      expect(chooseEnemyTarget([fighter(0), fighter(7), fighter(4)])).toBe(2);
    });
  });

  describe("when fighters tie on health", () => {
    it("picks the earliest index for determinism", () => {
      expect(chooseEnemyTarget([fighter(5), fighter(5)])).toBe(0);
    });
  });

  describe("when no fighter is alive", () => {
    it("returns -1", () => {
      expect(chooseEnemyTarget([fighter(0)])).toBe(-1);
    });
  });
});
