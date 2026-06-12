import Phaser from 'phaser';
import { GAME_FONT, GAME_HEIGHT, GAME_WIDTH } from '../GameRenderer.constants';

export const BOOT_SCENE_KEY = 'BootScene';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(BOOT_SCENE_KEY);
  }

  create(): void {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Fight or Flight', {
        fontFamily: GAME_FONT,
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
  }
}
