import { describe, expect, it } from "vitest";
import type { GameCharacter } from "../../GameRenderer.types";
import { createFighter, maxHealthFor } from "./createFighter";

const character: GameCharacter = {
  id: "IRIS",
  name: "Iris",
  stats: { power: 6, intelligence: 9, defense: 6, health: 7, refresh: 8 },
};

describe("createFighter", () => {
  describe("when instantiating a character", () => {
    it("starts the fighter at full derived health", () => {
      const fighter = createFighter(character);

      expect(fighter.maxHealth).toBe(maxHealthFor(character));
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
      const tanky = maxHealthFor({
        ...character,
        stats: { ...character.stats, health: 10 },
      });
      const fragile = maxHealthFor({
        ...character,
        stats: { ...character.stats, health: 1 },
      });

      expect(tanky).toBeGreaterThan(fragile);
    });
  });
});
