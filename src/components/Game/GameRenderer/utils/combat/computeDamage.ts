import type { Fighter } from "../../GameRenderer.types";

// Damage = the attacker's offensive output minus the defender's mitigation,
// floored at 1 so every hit always lands for something. Power is the main
// driver; intelligence adds a tactical edge (smarter fighters exploit openings);
// defense on the receiving end soaks part of it.
const POWER_WEIGHT = 4;
const INTELLIGENCE_WEIGHT = 0.5;
const DEFENSE_WEIGHT = 2;
const MIN_DAMAGE = 1;

/**
 * Pure damage calculation for a single hit. Deterministic from the two
 * fighters' stats so the outcome is predictable and testable.
 */
export const computeDamage = (attacker: Fighter, defender: Fighter): number => {
  const raw =
    attacker.stats.power * POWER_WEIGHT +
    attacker.stats.intelligence * INTELLIGENCE_WEIGHT -
    defender.stats.defense * DEFENSE_WEIGHT;

  return Math.max(MIN_DAMAGE, Math.round(raw));
};
