import type { Fighter, GameCharacter } from "../../GameRenderer.types";

// A fighter's health pool is derived from its defense stat, so sturdier
// characters take more hits to drop. Tuned so a typical character (defense 5)
// has 70 HP and survives ~3 average hits — long enough for stats to matter,
// short enough that a 5v5 resolves in a couple of minutes.
const BASE_HEALTH = 40;
const HEALTH_PER_DEFENSE = 6;

/** Derive the full health pool a character starts a fight with. */
export const maxHealthFor = (character: GameCharacter): number =>
  BASE_HEALTH + character.stats.defense * HEALTH_PER_DEFENSE;

/** Instantiate a combat-ready fighter from a roster character, at full health. */
export const createFighter = (character: GameCharacter): Fighter => {
  const maxHealth = maxHealthFor(character);

  return {
    id: character.id,
    name: character.name,
    stats: character.stats,
    maxHealth,
    health: maxHealth,
  };
};
