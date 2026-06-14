import { COLORS } from "@/constants/common";
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
  MAUVE: toColorNumber(COLORS.MAUVE),
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

export const HOME_BG_LAYER_KEYS = [
  "home-bg-layer-1",
  "home-bg-layer-2",
  "home-bg-layer-3",
  "home-bg-layer-4",
] as const;

export const MAX_ROSTER = 5;
// Stats are scored on this scale; the info-panel bars fill relative to it.
export const MAX_STAT = 10;

export const MUSIC_KEY_LOBBY = "music-lobby";
export const MUSIC_KEY_FIGHT = "music-fight";
