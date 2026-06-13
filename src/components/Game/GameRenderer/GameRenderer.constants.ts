import { COLORS } from "@/constants/common";
import type { GameCharacter } from "./GameRenderer.types";
import { toColorNumber } from "./utils/color/toColorNumber";

// Low base resolution rendered with pixelArt + Scale.FIT: the 960x540 host
// container scales this up 2x, giving chunkier text and crisp pixel doubling.
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;
// The web font (CSS family) we rasterize from, and the cache key for the
// bitmap font baked from it. Phaser `Text` anti-aliases glyphs, which blur when
// the low-res buffer is upscaled; `BitmapText` built from this baked atlas
// samples nearest-neighbor and stays crisp. See utils/generateBitmapFont.ts.
export const GAME_FONT = "Press Start 2P";
export const GAME_BITMAP_FONT = "press-start-2p-bitmap";
export const BACKGROUND_COLOR = COLORS.PERIWINKLE;

export const GAME_PALETTE = {
  BLUSH: toColorNumber(COLORS.BLUSH),
  ROSE: toColorNumber(COLORS.ROSE),
  ORCHID: toColorNumber(COLORS.ORCHID),
  LAVENDER: toColorNumber(COLORS.LAVENDER),
  PERIWINKLE: toColorNumber(COLORS.PERIWINKLE),
  RED: toColorNumber(COLORS.RED),
  GREEN: toColorNumber(COLORS.GREEN),
  ORANGE: toColorNumber(COLORS.ORANGE),
};

export const TEXT_COLOR = "#ffffff";
export const TEXT_COLOR_NUMBER = 0xff_ff_ff;

// Thickness of the hard pixel bevel that gives NES.css buttons/containers their
// chunky, depressed-corner look (mirrors `.nes-btn`'s `inset -4px -4px` shadow).
// Authored against the 480x270 base; the 2x host upscale renders it ~4px, the
// same on-screen weight as `.nes-btn`.
export const BEVEL = 2;

export const HOME_BG_KEY = "home-bg";

export const MAX_ROSTER = 5;
// Stats are scored on this scale; the info-panel bars fill relative to it.
export const MAX_STAT = 10;

export const CHARACTERS: GameCharacter[] = [
  { id: "IRIS",   name: "Iris",   stats: { power: 6, intelligence: 9, defense: 6, health: 7, refresh: 8 } },
  { id: "ZEPHYR", name: "Zephyr", stats: { power: 7, intelligence: 7, defense: 5, health: 6, refresh: 9 } },
  { id: "WENDY",  name: "Wendy",  stats: { power: 5, intelligence: 8, defense: 8, health: 8, refresh: 6 } },
  { id: "SKYE",   name: "Skye",   stats: { power: 8, intelligence: 6, defense: 4, health: 5, refresh: 7 } },
  { id: "SUNNY",  name: "Sunny",  stats: { power: 6, intelligence: 7, defense: 7, health: 9, refresh: 7 } },
  { id: "AURA",   name: "Aura",   stats: { power: 7, intelligence: 8, defense: 6, health: 7, refresh: 6 } },
  { id: "NEIL",   name: "Neil",   stats: { power: 9, intelligence: 5, defense: 5, health: 6, refresh: 5 } },
  { id: "GALE",   name: "Gale",   stats: { power: 8, intelligence: 6, defense: 7, health: 7, refresh: 6 } },
  { id: "THORA",  name: "Thora",  stats: { power: 9, intelligence: 4, defense: 9, health: 9, refresh: 3 } },
  { id: "VEGA",   name: "Vega",   stats: { power: 10, intelligence: 8, defense: 9, health: 10, refresh: 5 } },
];
