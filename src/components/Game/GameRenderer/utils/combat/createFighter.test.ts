import { describe, expect, it } from "vitest";
import type { CharacterResponse } from "@/services/api/schemas/character";
import { createFighter } from "./createFighter";

const character: CharacterResponse = {
  type: "IRIS",
  superpower: "LIGHT",
  stats: { power: 6, intelligence: 9, defense: 6, health: 7 },
};

describe("createFighter", () => {
  describe("when instantiating a character", () => {
    it("starts the fighter at full derived health", () => {
      const fighter = createFighter(character);

      expect(fighter.maxHealth).toBe(character.stats.health);
      expect(fighter.health).toBe(fighter.maxHealth);
    });

    it("carries over the character identity and stats", () => {
      const fighter = createFighter(character);

      expect(fighter.id).toBe("IRIS");
      expect(fighter.name).toBe("Iris");
      expect(fighter.stats).toEqual(character.stats);
    });
  });

  describe("when comparing characters with different health stats", () => {
    it("gives the higher-health fighter a larger health pool", () => {
      const tanky = createFighter({
        ...character,
        stats: { ...character.stats, health: 10 },
      });
      const fragile = createFighter({
        ...character,
        stats: { ...character.stats, health: 1 },
      });

      expect(tanky.maxHealth).toBeGreaterThan(fragile.maxHealth);
    });
  });
});
