import { COLORS } from "@/constants/common";
import { hashString } from "./hashString";

// A symmetric identicon-style face on a 5x5 grid: we generate the left three
// columns from the hash bits and mirror them, the way GitHub identicons do, so
// every placeholder avatar is distinct but balanced. Colours come from the game
// palette, keyed off the hash so they stay on-brand.
export const AVATAR_GRID = 5;
const HALF_COLUMNS = Math.ceil(AVATAR_GRID / 2); // 3 generated, last mirrored

const PALETTE = [
  COLORS.BLUSH,
  COLORS.ROSE,
  COLORS.ORCHID,
  COLORS.LAVENDER,
  COLORS.PERIWINKLE,
];
// Dark backdrop so the palette-coloured ink always reads, matching the dark
// avatar squares used elsewhere in the UI.
const BACKGROUND = "#1a1a2e";

export interface AvatarPattern {
  /** Row-major grid of filled (true) / empty (false) cells. */
  cells: boolean[][];
  foreground: string;
  background: string;
}

/**
 * Build a deterministic, vertically-symmetric avatar pattern for a character
 * id. Pure: same id always yields the same pattern and colour.
 */
export const buildAvatarPattern = (id: string): AvatarPattern => {
  const hash = hashString(id);
  const foreground = PALETTE[hash % PALETTE.length];

  const cells: boolean[][] = [];
  for (let row = 0; row < AVATAR_GRID; row += 1) {
    const cols: boolean[] = [];
    for (let column = 0; column < AVATAR_GRID; column += 1) {
      // Mirror the right half onto the left so the face is symmetric.
      const source = Math.min(column, AVATAR_GRID - 1 - column);
      const bit = (hash >>> (row * HALF_COLUMNS + source)) & 1;
      cols.push(bit === 1);
    }
    cells.push(cols);
  }

  return { cells, foreground, background: BACKGROUND };
};
