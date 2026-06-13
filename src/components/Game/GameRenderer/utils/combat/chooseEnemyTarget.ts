import type { Fighter } from "../../GameRenderer.types";
import { isAlive } from "./nextAliveIndex";

/**
 * The computer's targeting policy: focus-fire the alive enemy with the lowest
 * current health to remove fighters from the board as fast as possible. Ties
 * break toward the earliest index for determinism. Returns -1 if no target is
 * alive.
 */
export const chooseEnemyTarget = (team: Fighter[]): number => {
  let target = -1;
  let lowest = Number.POSITIVE_INFINITY;

  team.forEach((fighter, index) => {
    if (isAlive(fighter) && fighter.health < lowest) {
      lowest = fighter.health;
      target = index;
    }
  });

  return target;
};
