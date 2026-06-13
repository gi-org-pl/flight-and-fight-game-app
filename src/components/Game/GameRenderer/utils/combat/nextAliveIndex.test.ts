import { describe, expect, it } from "vitest";
import type { Fighter } from "../../GameRenderer.types";
import {
  aliveCount,
  isAlive,
  isTeamDefeated,
  nextAliveIndex,
} from "./nextAliveIndex";

const fighter = (health: number): Fighter => ({
  id: "x",
  name: "X",
  stats: { power: 1, speed: 1, defense: 1 },
  maxHealth: 10,
  health,
});

describe("isAlive", () => {
  describe("when a fighter has health", () => {
    it("reports it as alive", () => {
      expect(isAlive(fighter(1))).toBe(true);
    });
  });

  describe("when a fighter is at zero health", () => {
    it("reports it as not alive", () => {
      expect(isAlive(fighter(0))).toBe(false);
    });
  });
});

describe("aliveCount", () => {
  describe("when some fighters are down", () => {
    it("counts only the living", () => {
      expect(aliveCount([fighter(5), fighter(0), fighter(3)])).toBe(2);
    });
  });
});

describe("isTeamDefeated", () => {
  describe("when every fighter is down", () => {
    it("reports the team as defeated", () => {
      expect(isTeamDefeated([fighter(0), fighter(0)])).toBe(true);
    });
  });

  describe("when at least one fighter stands", () => {
    it("reports the team as not defeated", () => {
      expect(isTeamDefeated([fighter(0), fighter(2)])).toBe(false);
    });
  });
});

describe("nextAliveIndex", () => {
  describe("when the next fighter is alive", () => {
    it("returns that index", () => {
      expect(nextAliveIndex([fighter(5), fighter(5)], 1)).toBe(1);
    });
  });

  describe("when the search runs past the end", () => {
    it("wraps around to an earlier alive fighter", () => {
      expect(nextAliveIndex([fighter(5), fighter(0), fighter(0)], 1)).toBe(0);
    });
  });

  describe("when no fighter is alive", () => {
    it("returns -1", () => {
      expect(nextAliveIndex([fighter(0), fighter(0)], 0)).toBe(-1);
    });
  });

  describe("when the team is empty", () => {
    it("returns -1", () => {
      expect(nextAliveIndex([], 0)).toBe(-1);
    });
  });
});
