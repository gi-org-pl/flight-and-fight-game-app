import { COLORS } from "@/types/common";
import type { GameCharacter } from "./GameRenderer.types";
import { toColorNumber } from "./utils/toColorNumber";

// Low base resolution rendered with pixelArt + Scale.FIT: the 960x540 host
// container scales this up 2x, giving chunkier text and crisp pixel doubling.
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;
export const GAME_FONT = "Press Start 2P";
export const BACKGROUND_COLOR = COLORS.PERIWINKLE;

export const GAME_PALETTE = {
  BLUSH: toColorNumber(COLORS.BLUSH),
  ROSE: toColorNumber(COLORS.ROSE),
  ORCHID: toColorNumber(COLORS.ORCHID),
  LAVENDER: toColorNumber(COLORS.LAVENDER),
  PERIWINKLE: toColorNumber(COLORS.PERIWINKLE),
};

export const TEXT_COLOR = "#ffffff";
export const TEXT_COLOR_NUMBER = 0xff_ff_ff;

// Thickness of the hard pixel bevel that gives NES.css buttons/containers their
// chunky, depressed-corner look (mirrors `.nes-btn`'s `inset -4px -4px` shadow).
// Authored against the 480x270 base; the 2x host upscale renders it ~4px, the
// same on-screen weight as `.nes-btn`.
export const BEVEL = 2;

export const MAX_ROSTER = 5;

export const CHARACTERS: GameCharacter[] = [
  { id: "c1", name: "Falcon" },
  { id: "c2", name: "Viper" },
  { id: "c3", name: "Comet" },
  { id: "c4", name: "Raptor" },
  { id: "c5", name: "Blaze" },
  { id: "c6", name: "Storm" },
  { id: "c7", name: "Nova" },
  { id: "c8", name: "Talon" },
  { id: "c9", name: "Vortex" },
  { id: "c10", name: "Phantom" },
];
