import { COLORS } from '@/constants/common';
import type { GameCharacter } from './GameRenderer.types';
import { toColorNumber } from './utils/color/toColorNumber';

// Low base resolution rendered with pixelArt + Scale.FIT: the 960x540 host
// container scales this up 2x, giving chunkier text and crisp pixel doubling.
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;
// The web font (CSS family) we rasterize from, and the cache key for the
// bitmap font baked from it. Phaser `Text` anti-aliases glyphs, which blur when
// the low-res buffer is upscaled; `BitmapText` built from this baked atlas
// samples nearest-neighbor and stays crisp. See utils/generateBitmapFont.ts.
export const GAME_FONT = 'Press Start 2P';
export const GAME_BITMAP_FONT = 'press-start-2p-bitmap';
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

export const TEXT_COLOR = '#ffffff';
export const TEXT_COLOR_NUMBER = 0xff_ff_ff;

// Thickness of the hard pixel bevel that gives NES.css buttons/containers their
// chunky, depressed-corner look (mirrors `.nes-btn`'s `inset -4px -4px` shadow).
// Authored against the 480x270 base; the 2x host upscale renders it ~4px, the
// same on-screen weight as `.nes-btn`.
export const BEVEL = 2;

export const HOME_BG_KEY = 'home-bg';

export const MAX_ROSTER = 5;
// Stats are scored on this scale; the info-panel bars fill relative to it.
export const MAX_STAT = 10;

// Mocked roster — stats stand in for an API the game is not wired to yet.
export const CHARACTERS: GameCharacter[] = [
  { id: 'c1', name: 'Falcon', stats: { power: 7, speed: 8, defense: 5 } },
  { id: 'c2', name: 'Viper', stats: { power: 9, speed: 6, defense: 4 } },
  { id: 'c3', name: 'Comet', stats: { power: 5, speed: 10, defense: 3 } },
  { id: 'c4', name: 'Raptor', stats: { power: 8, speed: 7, defense: 6 } },
  { id: 'c5', name: 'Blaze', stats: { power: 10, speed: 5, defense: 5 } },
  { id: 'c6', name: 'Storm', stats: { power: 6, speed: 9, defense: 7 } },
  { id: 'c7', name: 'Nova', stats: { power: 7, speed: 7, defense: 7 } },
  { id: 'c8', name: 'Talon', stats: { power: 8, speed: 6, defense: 8 } },
  { id: 'c9', name: 'Vortex', stats: { power: 4, speed: 8, defense: 9 } },
  { id: 'c10', name: 'Phantom', stats: { power: 9, speed: 9, defense: 2 } },
];
