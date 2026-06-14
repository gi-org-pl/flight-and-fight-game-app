import Phaser from 'phaser';
import {
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
  HOME_BG_LAYER_KEYS,
} from '../GameRenderer.constants';
import type { StartSceneData } from '../GameRenderer.types';
import { createButton } from '../utils/widgets/createButton';
import {
  CHARACTER_SELECT_SCENE_KEY,
  CONNECT_SCENE_KEY,
  START_SCENE_KEY,
} from './sceneKeys';

const TITLE_Y = 55;
const BUTTONS_Y = GAME_HEIGHT - 45;

export class StartScene extends Phaser.Scene {
  private characters: StartSceneData['characters'] = [];

  constructor() {
    super(START_SCENE_KEY);
  }

  create(data: StartSceneData): void {
    this.characters = data.characters;
    this.cameras.main.fadeIn(350, 174, 158, 225);

    const bgLayers = HOME_BG_LAYER_KEYS.map((key) =>
      this.add
        .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, key)
        .setDisplaySize(GAME_WIDTH, GAME_HEIGHT),
    );
    const bg = this.add.container(0, 0, bgLayers);
    bg.setAlpha(0);
    this.tweens.add({
      targets: bg,
      alpha: 1,
      duration: 600,
      ease: 'Sine.easeOut',
    });

    const layer3 = bgLayers[2];
    this.tweens.add({
      targets: layer3,
      y: GAME_HEIGHT / 2 - 4,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    const singleBtn = createButton(
      this,
      GAME_WIDTH / 2 - 115,
      BUTTONS_Y,
      'Single Player',
      {
        width: 200,
        height: 40,
        fill: GAME_PALETTE.ROSE,
        fontSize: 12,
        onClick: () =>
          this.transitionTo(CHARACTER_SELECT_SCENE_KEY, {
            mode: 'single',
            characters: this.characters,
          }),
      },
    );
    singleBtn.setAlpha(0).setY(BUTTONS_Y + 28);
    this.tweens.add({
      targets: singleBtn,
      alpha: 1,
      y: BUTTONS_Y,
      duration: 500,
      ease: 'Back.easeOut',
      delay: 400,
      onComplete: () => {
        this.tweens.add({
          targets: singleBtn,
          y: BUTTONS_Y - 4,
          duration: 2000,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
      },
    });

    const multiBtn = createButton(
      this,
      GAME_WIDTH / 2 + 115,
      BUTTONS_Y,
      'Multiplayer',
      {
        width: 200,
        height: 40,
        fill: GAME_PALETTE.ROSE,
        fontSize: 12,
        onClick: () =>
          this.transitionTo(CONNECT_SCENE_KEY, {
            mode: 'multiplayer',
            characters: this.characters,
          }),
      },
    );
    multiBtn.setAlpha(0).setY(BUTTONS_Y + 28);
    this.tweens.add({
      targets: multiBtn,
      alpha: 1,
      y: BUTTONS_Y,
      duration: 500,
      ease: 'Back.easeOut',
      delay: 540,
      onComplete: () => {
        this.tweens.add({
          targets: multiBtn,
          y: BUTTONS_Y - 4,
          duration: 2200,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
      },
    });
  }

  private transitionTo(sceneKey: string, data: object): void {
    this.cameras.main.fadeOut(250, 174, 158, 225);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => this.scene.start(sceneKey, data),
    );
  }
}
