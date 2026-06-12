import Phaser from "phaser";
import {
  GAME_FONT,
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
  TEXT_COLOR,
} from "../GameRenderer.constants";
import type { WinnerSceneData } from "../GameRenderer.types";
import { createButton } from "../utils/createButton";
import { START_SCENE_KEY, WINNER_SCENE_KEY } from "./sceneKeys";

export class WinnerScene extends Phaser.Scene {
  constructor() {
    super(WINNER_SCENE_KEY);
  }

  create(data: WinnerSceneData): void {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, "Winner", {
        fontFamily: GAME_FONT,
        fontSize: "32px",
        color: TEXT_COLOR,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, data.winner, {
        fontFamily: GAME_FONT,
        fontSize: "24px",
        color: TEXT_COLOR,
      })
      .setOrigin(0.5);

    createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 90, "Play Again", {
      fill: GAME_PALETTE.ROSE,
      onClick: () => this.scene.start(START_SCENE_KEY),
    });
  }
}
