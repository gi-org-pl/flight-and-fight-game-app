import Phaser from 'phaser';
import {
  GAME_FONT,
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
  TEXT_COLOR,
} from '../GameRenderer.constants';
import type { MatchmakingSceneData } from '../GameRenderer.types';
import { createButton } from '../utils/createButton';
import {
  CHARACTER_SELECT_SCENE_KEY,
  MATCHMAKING_SCENE_KEY,
  START_SCENE_KEY,
} from './sceneKeys';

const SEARCH_DURATION_MS = 2500;

export class MatchmakingScene extends Phaser.Scene {
  constructor() {
    super(MATCHMAKING_SCENE_KEY);
  }

  create(data: MatchmakingSceneData): void {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'Searching for opponent...', {
        fontFamily: GAME_FONT,
        fontSize: '20px',
        color: TEXT_COLOR,
      })
      .setOrigin(0.5);

    const status = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, '.', {
        fontFamily: GAME_FONT,
        fontSize: '20px',
        color: TEXT_COLOR,
      })
      .setOrigin(0.5);

    this.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        status.setText('.'.repeat((status.text.length % 3) + 1));
      },
    });

    createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 80, 'Cancel', {
      fill: GAME_PALETTE.ORCHID,
      onClick: () => this.scene.start(START_SCENE_KEY),
    });

    // Wireframe stub: pretend an opponent was found after a short delay.
    this.time.delayedCall(SEARCH_DURATION_MS, () => {
      this.scene.start(CHARACTER_SELECT_SCENE_KEY, { mode: data.mode });
    });
  }
}
