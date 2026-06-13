import Phaser from "phaser";
import {
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
} from "../GameRenderer.constants";
import type { FightSceneData } from "../GameRenderer.types";
import { createBitmapText } from "../utils/text/createBitmapText";
import { createButton } from "../utils/widgets/createButton";
import { createPanel } from "../utils/widgets/createPanel";
import { FIGHT_SCENE_KEY, WINNER_SCENE_KEY } from "./sceneKeys";

const FIGHTER_WIDTH = 60;
const FIGHTER_HEIGHT = 90;

export class FightScene extends Phaser.Scene {
  constructor() {
    super(FIGHT_SCENE_KEY);
  }

  create(data: FightSceneData): void {
    const opponentLabel = data.mode === "multiplayer" ? "Opponent" : "Computer";

    createBitmapText(this, GAME_WIDTH / 2, 30, "Fight!", 16);

    this.drawFighter(GAME_WIDTH / 4, "You", GAME_PALETTE.ROSE);
    this.drawFighter((GAME_WIDTH / 4) * 3, opponentLabel, GAME_PALETTE.ORCHID);

    createBitmapText(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, "VS", 14);

    createBitmapText(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT - 65,
      `Roster: ${data.roster.length}`,
      8,
    );

    createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 35, "Finish Fight", {
      fill: GAME_PALETTE.LAVENDER,
      onClick: () => this.scene.start(WINNER_SCENE_KEY, { winner: "You" }),
    });
  }

  private drawFighter(x: number, label: string, fill: number): void {
    const y = GAME_HEIGHT / 2;

    createPanel(this, x, y, FIGHTER_WIDTH, FIGHTER_HEIGHT, fill);
    // HP bar above the fighter, framed like a slim NES panel.
    createPanel(
      this,
      x,
      y - FIGHTER_HEIGHT / 2 - 12,
      FIGHTER_WIDTH,
      6,
      GAME_PALETTE.BLUSH,
    );
    createBitmapText(this, x, y + FIGHTER_HEIGHT / 2 + 12, label, 9);
  }
}
