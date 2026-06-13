import { describe, expect, it } from "vitest";
import type { Fighter } from "../../GameRenderer.types";
import { computeDamage } from "./computeDamage";

const fighter = (
  power: number,
  intelligence: number,
  defense: number,
): Fighter => ({
  id: "x",
  name: "X",
  stats: { power, intelligence, defense, health: 5, refresh: 5 },
  maxHealth: 100,
  health: 100,
});

describe("computeDamage", () => {
  describe("when a strong attacker hits a weak defender", () => {
    it("deals more damage than a weak attacker would", () => {
      const strong = computeDamage(fighter(10, 8, 0), fighter(0, 0, 2));
      const weak = computeDamage(fighter(3, 2, 0), fighter(0, 0, 2));

      expect(strong).toBeGreaterThan(weak);
    });
  });

  describe("when the defender is heavily armored", () => {
    it("never deals less than one damage", () => {
      const damage = computeDamage(fighter(1, 0, 0), fighter(0, 0, 10));

      expect(damage).toBe(1);
    });
  });

  describe("when given identical fighters", () => {
    it("returns a stable, rounded integer", () => {
      const damage = computeDamage(fighter(7, 8, 5), fighter(7, 8, 5));

      expect(damage).toBe(Math.round(7 * 4 + 8 * 0.5 - 5 * 2));
      expect(Number.isInteger(damage)).toBe(true);
    });
  });
});
