import type { CharacterResponse } from "@/services/api/schemas/character";

/**
 * Pick the computer's roster from the character pool. Prefers characters the
 * player did NOT take so the two sides look distinct; if the pool is too small
 * to fill the roster from the leftovers, it falls back to reusing taken ones.
 *
 * Deterministic (no RNG): given the same pool and player picks it always
 * returns the same enemy roster, which keeps it testable and reproducible.
 * A real opponent roster will arrive over the API in multiplayer later.
 */
export const createEnemyRoster = (
  pool: CharacterResponse[],
  playerRoster: string[],
  size: number,
): CharacterResponse[] => {
  const taken = new Set(playerRoster);
  const available = pool.filter((character) => !taken.has(character.type));
  const fallback = pool.filter((character) => taken.has(character.type));

  return [...available, ...fallback].slice(0, size);
};
