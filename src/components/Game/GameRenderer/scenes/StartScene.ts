import Phaser from "phaser";
import {
  GAME_FONT,
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
  TEXT_COLOR,
} from "../GameRenderer.constants";
import type { GameMode } from "../GameRenderer.types";
import { createButton } from "../utils/createButton";
import {
  CHARACTER_SELECT_SCENE_KEY,
  MATCHMAKING_SCENE_KEY,
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

    this.add
      .text(GAME_WIDTH / 2, 110, "Flight and Fight", {
        fontFamily: GAME_FONT,
        fontSize: "32px",
        color: TEXT_COLOR,
      })
      .setOrigin(0.5);

    this.singleButton = createButton(
      this,
      GAME_WIDTH / 2 - 150,
      250,
      "Single Player",
      { width: 260, onClick: () => this.selectMode("single") },
    );
    this.multiButton = createButton(
      this,
      GAME_WIDTH / 2 + 150,
      250,
      "Multiplayer",
      { width: 260, onClick: () => this.selectMode("multiplayer") },
    );

    createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 90, "Start", {
      fill: GAME_PALETTE.ROSE,
      fontSize: "20px",
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
      this.scene.start(MATCHMAKING_SCENE_KEY, { mode: this.mode });
      return;
    }

    this.scene.start(CHARACTER_SELECT_SCENE_KEY, { mode: this.mode });
  }
}
