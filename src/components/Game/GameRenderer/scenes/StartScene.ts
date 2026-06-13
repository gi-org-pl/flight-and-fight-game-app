import Phaser from "phaser";
import {
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
  HOME_BG_KEY,
} from "../GameRenderer.constants";
import { fadeToScene } from "../utils/scene/fadeToScene";
import { createBitmapText } from "../utils/text/createBitmapText";
import { createButton } from "../utils/widgets/createButton";
import {
  CHARACTER_SELECT_SCENE_KEY,
  CONNECT_SCENE_KEY,
  START_SCENE_KEY,
} from "./sceneKeys";

export class StartScene extends Phaser.Scene {
  constructor() {
    super(START_SCENE_KEY);
  }

  create(): void {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, HOME_BG_KEY);

    createBitmapText(this, GAME_WIDTH / 2, 55, "Flight and Fight", 20);

    createButton(
      this,
      GAME_WIDTH / 2 - 115,
      GAME_HEIGHT - 45,
      "Single Player",
      {
        width: 200,
        height: 40,
        fill: GAME_PALETTE.ROSE,
        fontSize: 12,
        onClick: () =>
          fadeToScene(this, CHARACTER_SELECT_SCENE_KEY, { mode: "single" }),
      },
    );

    createButton(this, GAME_WIDTH / 2 + 115, GAME_HEIGHT - 45, "Multiplayer", {
      width: 200,
      height: 40,
      fill: GAME_PALETTE.ROSE,
      fontSize: 12,
      onClick: () =>
        fadeToScene(this, CONNECT_SCENE_KEY, { mode: "multiplayer" }),
    });
  }
}
