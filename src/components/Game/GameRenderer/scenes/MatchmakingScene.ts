import Phaser from "phaser";
import {
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
} from "../GameRenderer.constants";
import type { MatchmakingSceneData } from "../GameRenderer.types";
import { createBitmapText } from "../utils/createBitmapText";
import { createButton } from "../utils/createButton";
import {
  CHARACTER_SELECT_SCENE_KEY,
  MATCHMAKING_SCENE_KEY,
  START_SCENE_KEY,
} from "./sceneKeys";

const SEARCH_DURATION_MS = 2500;

export class MatchmakingScene extends Phaser.Scene {
  constructor() {
    super(MATCHMAKING_SCENE_KEY);
  }

  create(data: MatchmakingSceneData): void {
    createBitmapText(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 20,
      "Searching for opponent...",
      12,
    );

    const status = createBitmapText(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 5,
      ".",
      12,
    );

    this.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        status.setText(".".repeat((status.text.length % 3) + 1));
      },
    });

    createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 40, "Cancel", {
      fill: GAME_PALETTE.ORCHID,
      onClick: () => this.scene.start(START_SCENE_KEY),
    });

    // Wireframe stub: pretend an opponent was found after a short delay.
    this.time.delayedCall(SEARCH_DURATION_MS, () => {
      this.scene.start(CHARACTER_SELECT_SCENE_KEY, { mode: data.mode });
    });
  }
}
