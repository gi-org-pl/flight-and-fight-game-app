import { describe, expect, it } from "vitest";
import type { GameCharacter } from "../../GameRenderer.types";
import { createFighter, maxHealthFor } from "./createFighter";

const character: GameCharacter = {
  id: "c1",
  name: "Falcon",
  stats: { power: 7, speed: 8, defense: 5 },
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

      expect(fighter.id).toBe("c1");
      expect(fighter.name).toBe("Falcon");
      expect(fighter.stats).toEqual(character.stats);
    });
  });

  describe("when comparing defensive characters", () => {
    it("gives the higher-defense fighter a larger health pool", () => {
      const tanky = maxHealthFor({
        ...character,
        stats: { ...character.stats, defense: 9 },
      });
      const fragile = maxHealthFor({
        ...character,
        stats: { ...character.stats, defense: 2 },
      });

      expect(tanky).toBeGreaterThan(fragile);
    });
  });
});
