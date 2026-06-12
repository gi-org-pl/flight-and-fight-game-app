import Phaser from "phaser";
import {
  CHARACTERS,
  GAME_FONT,
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
  MAX_ROSTER,
  TEXT_COLOR,
} from "../GameRenderer.constants";
import type { CharacterSelectSceneData } from "../GameRenderer.types";
import { createButton } from "../utils/createButton";
import { toggleSelection } from "../utils/toggleSelection";
import {
  CHARACTER_SELECT_SCENE_KEY,
  FIGHT_SCENE_KEY,
  START_SCENE_KEY,
} from "./sceneKeys";

const COLUMNS = 5;
const CELL_WIDTH = 150;
const CELL_HEIGHT = 110;
const GAP_X = 20;
const GAP_Y = 24;
const GRID_TOP = 200;

export class CharacterSelectScene extends Phaser.Scene {
  private mode: CharacterSelectSceneData["mode"] = "single";
  private selected: string[] = [];
  private cards = new Map<string, Phaser.GameObjects.Rectangle>();
  private counter?: Phaser.GameObjects.Text;
  private confirmButton?: Phaser.GameObjects.Container;

  constructor() {
    super(CHARACTER_SELECT_SCENE_KEY);
  }

  create(data: CharacterSelectSceneData): void {
    this.mode = data.mode;
    this.selected = [];
    this.cards = new Map();

    this.add
      .text(GAME_WIDTH / 2, 70, `Choose ${MAX_ROSTER} characters`, {
        fontFamily: GAME_FONT,
        fontSize: "22px",
        color: TEXT_COLOR,
      })
      .setOrigin(0.5);

    const gridWidth = COLUMNS * CELL_WIDTH + (COLUMNS - 1) * GAP_X;
    const startX = (GAME_WIDTH - gridWidth) / 2 + CELL_WIDTH / 2;

    CHARACTERS.forEach((character, index) => {
      const column = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);
      const x = startX + column * (CELL_WIDTH + GAP_X);
      const y = GRID_TOP + row * (CELL_HEIGHT + GAP_Y);

      const card = this.add
        .rectangle(x, y, CELL_WIDTH, CELL_HEIGHT, GAME_PALETTE.LAVENDER)
        .setStrokeStyle(2, GAME_PALETTE.BLUSH)
        .setInteractive({ useHandCursor: true });
      this.add
        .text(x, y, character.name, {
          fontFamily: GAME_FONT,
          fontSize: "12px",
          color: TEXT_COLOR,
        })
        .setOrigin(0.5);

      card.on("pointerup", () => this.toggle(character.id));
      this.cards.set(character.id, card);
    });

    this.counter = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 110, "", {
        fontFamily: GAME_FONT,
        fontSize: "14px",
        color: TEXT_COLOR,
      })
      .setOrigin(0.5);

    createButton(this, GAME_WIDTH / 2 - 160, GAME_HEIGHT - 50, "Back", {
      width: 200,
      fill: GAME_PALETTE.ORCHID,
      onClick: () => this.scene.start(START_SCENE_KEY),
    });
    this.confirmButton = createButton(
      this,
      GAME_WIDTH / 2 + 160,
      GAME_HEIGHT - 50,
      "Confirm",
      {
        width: 200,
        fill: GAME_PALETTE.ROSE,
        onClick: () => this.confirm(),
      },
    );

    this.refresh();
  }

  private toggle(id: string): void {
    this.selected = toggleSelection(this.selected, id, MAX_ROSTER);
    this.refresh();
  }

  private refresh(): void {
    this.cards.forEach((card, id) => {
      card.setFillStyle(
        this.selected.includes(id) ? GAME_PALETTE.ROSE : GAME_PALETTE.LAVENDER,
      );
    });

    this.counter?.setText(`Selected: ${this.selected.length}/${MAX_ROSTER}`);

    const ready = this.selected.length === MAX_ROSTER;
    this.confirmButton?.setAlpha(ready ? 1 : 0.4);
  }

  private confirm(): void {
    if (this.selected.length !== MAX_ROSTER) {
      return;
    }

    this.scene.start(FIGHT_SCENE_KEY, {
      mode: this.mode,
      roster: this.selected,
    });
  }
}
