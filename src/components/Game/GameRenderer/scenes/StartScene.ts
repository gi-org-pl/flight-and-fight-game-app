import Phaser from "phaser";
import {
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
} from "../GameRenderer.constants";
import type { GameMode } from "../GameRenderer.types";
import { createBitmapText } from "../utils/text/createBitmapText";
import { createButton } from "../utils/widgets/createButton";
import {
  CHARACTER_SELECT_SCENE_KEY,
  CONNECT_SCENE_KEY,
  START_SCENE_KEY,
} from "./sceneKeys";

export class StartScene extends Phaser.Scene {
  private mode: GameMode = "single";
  private singleButton?: Phaser.GameObjects.Container;
  private multiButton?: Phaser.GameObjects.Container;

  constructor() {
    super(START_SCENE_KEY);
  }

  create(): void {
    this.mode = "single";

    createBitmapText(this, GAME_WIDTH / 2, 55, "Flight and Fight", 20);

    this.singleButton = createButton(
      this,
      GAME_WIDTH / 2 - 75,
      125,
      "Single Player",
      { width: 140, onClick: () => this.selectMode("single") },
    );
    this.multiButton = createButton(
      this,
      GAME_WIDTH / 2 + 75,
      125,
      "Multiplayer",
      { width: 140, onClick: () => this.selectMode("multiplayer") },
    );

    createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 45, "Start", {
      fill: GAME_PALETTE.ROSE,
      fontSize: 14,
      onClick: () => this.start(),
    });

    this.refreshModeHighlight();
  }

  private selectMode(mode: GameMode): void {
    this.mode = mode;
    this.refreshModeHighlight();
  }

  private refreshModeHighlight(): void {
    this.singleButton?.setAlpha(this.mode === "single" ? 1 : 0.5);
    this.multiButton?.setAlpha(this.mode === "multiplayer" ? 1 : 0.5);
  }

  private start(): void {
    if (this.mode === "multiplayer") {
      this.scene.start(CONNECT_SCENE_KEY, { mode: this.mode });
      return;
    }

    this.scene.start(CHARACTER_SELECT_SCENE_KEY, { mode: this.mode });
  }
}
