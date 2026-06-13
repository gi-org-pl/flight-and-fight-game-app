/** A fighter slot in the 480x270 game space, as an (x, y) centre point. */
export interface WedgeSlot {
  x: number;
  y: number;
}

// The player-side (left) battle formation, taken straight from the design: a
// single apex fighter nearest the centre line, fanning out into an inner pair
// and a wider outer pair that recede toward the team's back edge — a chevron
// pointing at the enemy. The enemy team mirrors these across the centre line
// (see the scene). Coordinates are in the 480x270 game space.
const PLAYER_FORMATION: WedgeSlot[] = [
  { x: 177, y: 145 }, // apex — front, nearest the centre line
  { x: 115, y: 105 }, // inner top
  { x: 115, y: 165 }, // inner bottom
  { x: 52, y: 85 }, // outer top
  { x: 52, y: 185 }, // outer bottom
];

/**
 * Player-side slots for a roster of `count` fighters (capped at the five-slot
 * formation). Pure: the formation is fixed design data. The leading fighter is
 * highlighted by the scene wherever it sits — placement follows roster order.
 */
export const wedgePositions = (count: number): WedgeSlot[] =>
  PLAYER_FORMATION.slice(0, Math.max(0, count));
