import type { CharacterResponse } from "@/services/api/schemas/character";
import type { Fighter } from "../../GameRenderer.types";
import { toDisplayName } from "../character/toDisplayName";

// A fighter's health pool scales from the character's health stat (1–10).
// Tuned so health=5 yields 70 HP (survives ~3 average hits) and health=10
// reaches 100 HP — long enough for stats to matter, short enough that a 5v5
// resolves in a couple of minutes.
const BASE_HEALTH = 20;
const HEALTH_PER_STAT = 8;

/** Derive the full health pool a character starts a fight with. */
export const maxHealthFor = (character: CharacterResponse): number =>
  BASE_HEALTH + character.stats.health * HEALTH_PER_STAT;

/** Instantiate a combat-ready fighter from a roster character, at full health. */
export const createFighter = (character: CharacterResponse): Fighter => {
  const maxHealth = maxHealthFor(character);

  return {
    id: character.type,
    name: toDisplayName(character.type),
    stats: character.stats,
    maxHealth,
    health: maxHealth,
    superpowerLastUsedRound: 0,
  };
};
