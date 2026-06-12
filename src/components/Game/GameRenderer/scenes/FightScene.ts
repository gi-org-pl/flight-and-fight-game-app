import Phaser from 'phaser';
import {
  GAME_FONT,
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
  TEXT_COLOR,
  TEXT_COLOR_NUMBER,
} from '../GameRenderer.constants';
import type { FightSceneData } from '../GameRenderer.types';
import { createButton } from '../utils/createButton';
import { FIGHT_SCENE_KEY, WINNER_SCENE_KEY } from './sceneKeys';

const FIGHTER_WIDTH = 120;
const FIGHTER_HEIGHT = 180;

export class FightScene extends Phaser.Scene {
  constructor() {
    super(FIGHT_SCENE_KEY);
  }

  create(data: FightSceneData): void {
    const opponentLabel = data.mode === 'multiplayer' ? 'Opponent' : 'Computer';

    this.add
      .text(GAME_WIDTH / 2, 60, 'Fight!', {
        fontFamily: GAME_FONT,
        fontSize: '28px',
        color: TEXT_COLOR,
      })
      .setOrigin(0.5);

    this.drawFighter(GAME_WIDTH / 4, 'You', GAME_PALETTE.ROSE);
    this.drawFighter((GAME_WIDTH / 4) * 3, opponentLabel, GAME_PALETTE.ORCHID);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'VS', {
        fontFamily: GAME_FONT,
        fontSize: '24px',
        color: TEXT_COLOR,
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 130,
        `Roster: ${data.roster.length}`,
        {
          fontFamily: GAME_FONT,
          fontSize: '12px',
          color: TEXT_COLOR,
        },
      )
      .setOrigin(0.5);

    createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 70, 'Finish Fight', {
      fill: GAME_PALETTE.LAVENDER,
      onClick: () => this.scene.start(WINNER_SCENE_KEY, { winner: 'You' }),
    });
  }

  private drawFighter(x: number, label: string, fill: number): void {
    const y = GAME_HEIGHT / 2;

    this.add
      .rectangle(x, y, FIGHTER_WIDTH, FIGHTER_HEIGHT, fill)
      .setStrokeStyle(2, GAME_PALETTE.BLUSH);
    // Wireframe HP bar above the fighter.
    this.add
      .rectangle(
        x,
        y - FIGHTER_HEIGHT / 2 - 24,
        FIGHTER_WIDTH,
        12,
        GAME_PALETTE.BLUSH,
      )
      .setStrokeStyle(2, TEXT_COLOR_NUMBER);
    this.add
      .text(x, y + FIGHTER_HEIGHT / 2 + 24, label, {
        fontFamily: GAME_FONT,
        fontSize: '14px',
        color: TEXT_COLOR,
      })
      .setOrigin(0.5);
  }
}
