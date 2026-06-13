import Phaser from "phaser";
import {
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
} from "../GameRenderer.constants";
import type { WinnerSceneData } from "../GameRenderer.types";
import { fadeToScene } from "../utils/scene/fadeToScene";
import { createBitmapText } from "../utils/text/createBitmapText";
import { createButton } from "../utils/widgets/createButton";
import { START_SCENE_KEY, WINNER_SCENE_KEY } from "./sceneKeys";

export class WinnerScene extends Phaser.Scene {
  constructor() {
    super(WINNER_SCENE_KEY);
  }

  create(data: WinnerSceneData): void {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    createBitmapText(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, "Winner", 18);

    createBitmapText(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, data.winner, 14);

    createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 45, "Play Again", {
      fill: GAME_PALETTE.ROSE,
      onClick: () => fadeToScene(this, START_SCENE_KEY),
    });
  }
}
