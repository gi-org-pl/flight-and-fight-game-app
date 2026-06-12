import { COLORS } from '@/types/common';
import type { GameCharacter } from './GameRenderer.types';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const GAME_FONT = 'Press Start 2P';
export const BACKGROUND_COLOR = COLORS.PERIWINKLE;

const toColorNumber = (hex: string): number =>
  Number.parseInt(hex.slice(1), 16);

export const GAME_PALETTE = {
  BLUSH: toColorNumber(COLORS.BLUSH),
  ROSE: toColorNumber(COLORS.ROSE),
  ORCHID: toColorNumber(COLORS.ORCHID),
  LAVENDER: toColorNumber(COLORS.LAVENDER),
  PERIWINKLE: toColorNumber(COLORS.PERIWINKLE),
};

export const TEXT_COLOR = '#ffffff';
export const TEXT_COLOR_NUMBER = 0xff_ff_ff;

export const MAX_ROSTER = 5;

export const CHARACTERS: GameCharacter[] = [
  { id: 'c1', name: 'Falcon' },
  { id: 'c2', name: 'Viper' },
  { id: 'c3', name: 'Comet' },
  { id: 'c4', name: 'Raptor' },
  { id: 'c5', name: 'Blaze' },
  { id: 'c6', name: 'Storm' },
  { id: 'c7', name: 'Nova' },
  { id: 'c8', name: 'Talon' },
  { id: 'c9', name: 'Vortex' },
  { id: 'c10', name: 'Phantom' },
];
