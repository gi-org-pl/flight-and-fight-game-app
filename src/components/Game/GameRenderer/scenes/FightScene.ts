import Phaser from "phaser";
import {
  GAME_FONT,
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
  TEXT_COLOR,
} from "../GameRenderer.constants";
import type { FightSceneData } from "../GameRenderer.types";
import { createButton } from "../utils/createButton";
import { createPanel } from "../utils/createPanel";
import { FIGHT_SCENE_KEY, WINNER_SCENE_KEY } from "./sceneKeys";

const FIGHTER_WIDTH = 60;
const FIGHTER_HEIGHT = 90;

export class FightScene extends Phaser.Scene {
  constructor() {
    super(FIGHT_SCENE_KEY);
  }

  create(data: FightSceneData): void {
    const opponentLabel = data.mode === "multiplayer" ? "Opponent" : "Computer";

    this.add
      .text(GAME_WIDTH / 2, 30, "Fight!", {
        fontFamily: GAME_FONT,
        fontSize: "16px",
        color: TEXT_COLOR,
      })
      .setOrigin(0.5);

    this.drawFighter(GAME_WIDTH / 4, "You", GAME_PALETTE.ROSE);
    this.drawFighter((GAME_WIDTH / 4) * 3, opponentLabel, GAME_PALETTE.ORCHID);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "VS", {
        fontFamily: GAME_FONT,
        fontSize: "14px",
        color: TEXT_COLOR,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 65, `Roster: ${data.roster.length}`, {
        fontFamily: GAME_FONT,
        fontSize: "8px",
        color: TEXT_COLOR,
      })
      .setOrigin(0.5);

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
    this.add
      .text(x, y + FIGHTER_HEIGHT / 2 + 12, label, {
        fontFamily: GAME_FONT,
        fontSize: "9px",
        color: TEXT_COLOR,
      })
      .setOrigin(0.5);
  }
}
