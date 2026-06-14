import type { CharacterResponse } from "@/services/api/schemas/character";
import type { Fighter } from "../../GameRenderer.types";
import { toDisplayName } from "../character/toDisplayName";

/** Instantiate a combat-ready fighter from a roster character, at full health. */
export const createFighter = (character: CharacterResponse): Fighter => {
  return {
    id: character.type,
    name: toDisplayName(character.type),
    superpower: character.superpower,
    stats: character.stats,
    maxHealth: character.stats.health,
    health: character.stats.health,
    superpowerLastUsedRound: 0,
  };
};
