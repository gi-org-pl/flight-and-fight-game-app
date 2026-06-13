import type { Fighter } from "../../GameRenderer.types";

/** A fighter is in the fight while it still has health. */
export const isAlive = (fighter: Fighter): boolean => fighter.health > 0;

/** How many fighters on a team are still standing. */
export const aliveCount = (team: Fighter[]): number =>
  team.filter(isAlive).length;

/** A team is defeated once none of its fighters are alive. */
export const isTeamDefeated = (team: Fighter[]): boolean =>
  aliveCount(team) === 0;

/**
 * The index of the next alive fighter at or after `from`, cycling past the end
 * of the team back to the start — this is how the leading attacker rotates
 * after each hit. Returns -1 when the whole team is down.
 */
export const nextAliveIndex = (team: Fighter[], from: number): number => {
  if (team.length === 0) {
    return -1;
  }

  for (let step = 0; step < team.length; step += 1) {
    const index = (from + step) % team.length;
    if (isAlive(team[index])) {
      return index;
    }
  }

  return -1;
};
