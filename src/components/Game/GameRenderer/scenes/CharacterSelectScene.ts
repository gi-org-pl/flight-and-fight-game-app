import Phaser from "phaser";
import {
  CHARACTERS,
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
  MAX_ROSTER,
  MAX_STAT,
} from "../GameRenderer.constants";
import type {
  CharacterSelectSceneData,
  GameCharacter,
  SessionInfo,
} from "../GameRenderer.types";
import { avatarTextureKey } from "../utils/avatar/generateAvatar";
import { darkenColor } from "../utils/color/darkenColor";
import { fadeToScene } from "../utils/scene/fadeToScene";
import { toggleSelection } from "../utils/selection/toggleSelection";
import { createBitmapText } from "../utils/text/createBitmapText";
import { createButton } from "../utils/widgets/createButton";
import { createPanel } from "../utils/widgets/createPanel";
import {
  CHARACTER_SELECT_SCENE_KEY,
  FIGHT_SCENE_KEY,
  START_SCENE_KEY,
} from "./sceneKeys";

// The bitmap font is baked at 16px (NATIVE_PX) from Press Start 2P — itself an
// 8px-grid face. Only 16 and 8 land on a clean integer downscale of the atlas;
// 8 is therefore the smallest size that stays crisp. Anything smaller samples
// the 1-bit mask at a fractional ratio and smears into noise, so 8 is the floor
// for every label here. Sizes drive the layout budget below.
const FONT_TITLE = 16;
const FONT_BODY = 8;
const FONT_HEADER = 16;

// --- Roster grid (left) -----------------------------------------------------
const COLUMNS = 5;
const CELL_WIDTH = 56;
const CELL_HEIGHT = 58;
const AVATAR_SIZE = 36;
const AVATAR_OFFSET_Y = -7;
const NAME_OFFSET_Y = 21;
const GRID_GAP_X = 3;
const GRID_GAP_Y = 14;
const GRID_LEFT = 12;
// Order badge: a small filled square in the card's top-left corner with the
// pick number on it, so the digit reads against the dark avatar instead of
// vanishing into it.
const BADGE_SIZE = 16;
const BADGE_INSET = 3;

// --- Info panel (right) -----------------------------------------------------
const INFO_X = 394;
const INFO_TOP = 46;
const INFO_WIDTH = 150;
const INFO_HEIGHT = 168;
// Avatar pinned to the top-left corner of the info panel.
const INFO_AVATAR_SIZE = 40;
const INFO_PANEL_LEFT = INFO_X - INFO_WIDTH / 2; // 319
const INFO_AVATAR_X = INFO_PANEL_LEFT + 8 + INFO_AVATAR_SIZE / 2; // 347
// FIGHTER label sits at INFO_TOP+14 (8px tall) → bottom ≈64; push avatar below it.
const INFO_AVATAR_Y = INFO_TOP + 26 + INFO_AVATAR_SIZE / 2; // 92
// Name centered in the space to the right of the avatar.
const INFO_NAME_X = Math.round(
  (INFO_PANEL_LEFT + INFO_AVATAR_SIZE + 12 + INFO_X + INFO_WIDTH / 2) / 2,
); // ≈418
const INFO_NAME_Y = INFO_AVATAR_Y;
// Stat rows: label (left) — bar — value (right).
const STAT_LABEL_X = 346;
const STAT_VALUE_X = 446;
const STAT_BAR_LEFT = 364;
const STAT_BAR_MAX_WIDTH = 68;
const STAT_BAR_HEIGHT = 8;
const STAT_ROW_GAP = 14;
const STAT_FIRST_ROW_Y = INFO_AVATAR_Y + INFO_AVATAR_SIZE / 2 + 16; // 110

// Two grid rows, vertically centered against the info panel so the columns and
// the card line up along the same band.
const GRID_BLOCK_HEIGHT = 2 * CELL_HEIGHT + GRID_GAP_Y;
const GRID_TOP =
  INFO_TOP + (INFO_HEIGHT - GRID_BLOCK_HEIGHT) / 2 + CELL_HEIGHT / 2;

const STAT_LABELS: { key: keyof GameCharacter["stats"]; label: string }[] = [
  { key: "health", label: "HP" },
  { key: "power", label: "PWR" },
  { key: "intelligence", label: "INT" },
  { key: "defense", label: "DEF" },
];

// Mocked latency before the (fake) opponent locks in their roster. The waiting
// state only ever shows in multiplayer; single-player players never wait.
const OPPONENT_SELECT_DELAY_MS = 2500;

interface CardView {
  background: Phaser.GameObjects.Rectangle;
  avatar: Phaser.GameObjects.Image;
  badge: Phaser.GameObjects.Rectangle;
  order: Phaser.GameObjects.BitmapText;
}

interface InfoView {
  avatar: Phaser.GameObjects.Image;
  name: Phaser.GameObjects.BitmapText;
  placeholder: Phaser.GameObjects.BitmapText;
  bars: Phaser.GameObjects.Rectangle[];
  values: Phaser.GameObjects.BitmapText[];
}

export class CharacterSelectScene extends Phaser.Scene {
  private mode: CharacterSelectSceneData["mode"] = "single";
  private session?: SessionInfo;
  private selected: string[] = [];
  private opponentReady = true;
  private awaitingOpponent = false;
  private cards = new Map<string, CardView>();
  private info?: InfoView;
  private status?: Phaser.GameObjects.BitmapText;
  private flightButton?: Phaser.GameObjects.Container;

  constructor() {
    super(CHARACTER_SELECT_SCENE_KEY);
  }

  create(data: CharacterSelectSceneData): void {
    this.mode = data.mode;
    this.session = data.session;
    this.selected = [];
    this.awaitingOpponent = false;
    // Single-player has no opponent to wait on, so it starts ready.
    this.opponentReady = data.mode === "single";
    this.cards = new Map();

    createBitmapText(
      this,
      GAME_WIDTH / 2,
      20,
      `Choose ${MAX_ROSTER} Fighters`,
      FONT_TITLE,
    );
    createBitmapText(
      this,
      GAME_WIDTH / 2,
      36,
      "Pick order sets your fight sequence",
      FONT_BODY,
      GAME_PALETTE.LAVENDER,
    );

    this.buildGrid();
    this.buildInfoPanel();
    this.buildControls();

    if (this.mode === "multiplayer") {
      this.time.delayedCall(OPPONENT_SELECT_DELAY_MS, () =>
        this.onOpponentReady(),
      );
    }

    this.refresh();
  }

  private buildGrid(): void {
    CHARACTERS.forEach((character, index) => {
      const column = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);
      const x = GRID_LEFT + CELL_WIDTH / 2 + column * (CELL_WIDTH + GRID_GAP_X);
      const y = GRID_TOP + row * (CELL_HEIGHT + GRID_GAP_Y);

      const background = createPanel(
        this,
        x,
        y,
        CELL_WIDTH,
        CELL_HEIGHT,
        GAME_PALETTE.LAVENDER,
      ).setInteractive({ useHandCursor: true });

      // Generated placeholder avatar standing in for real character art.
      const avatar = this.add
        .image(x, y + AVATAR_OFFSET_Y, avatarTextureKey(character.id))
        .setDisplaySize(AVATAR_SIZE, AVATAR_SIZE);
      createBitmapText(this, x, y + NAME_OFFSET_Y, character.name, FONT_BODY);

      // Selection-order badge: a filled corner square plus the pick number,
      // drawn over the avatar and hidden until the card is picked.
      const badgeX = x - CELL_WIDTH / 2 + BADGE_INSET + BADGE_SIZE / 2;
      const badgeY = y - CELL_HEIGHT / 2 + BADGE_INSET + BADGE_SIZE / 2;
      const badge = this.add
        .rectangle(
          badgeX,
          badgeY,
          BADGE_SIZE,
          BADGE_SIZE,
          darkenColor(GAME_PALETTE.ROSE),
        )
        .setVisible(false);
      const order = createBitmapText(
        this,
        badgeX,
        badgeY,
        "",
        FONT_BODY,
      ).setVisible(false);

      background.on("pointerover", () => this.updateInfo(character));
      background.on("pointerup", () => this.toggle(character));

      this.cards.set(character.id, { background, avatar, badge, order });
    });
  }

  private buildInfoPanel(): void {
    const centerY = INFO_TOP + INFO_HEIGHT / 2;
    createPanel(
      this,
      INFO_X,
      centerY,
      INFO_WIDTH,
      INFO_HEIGHT,
      GAME_PALETTE.ORCHID,
    );
    createBitmapText(
      this,
      INFO_X,
      INFO_TOP + 14,
      "FIGHTER",
      FONT_BODY,
    ).setAlpha(0.5);

    const placeholder = createBitmapText(
      this,
      INFO_X,
      centerY,
      "Hover a fighter",
      FONT_BODY,
      GAME_PALETTE.LAVENDER,
    );

    const avatar = this.add
      .image(INFO_AVATAR_X, INFO_AVATAR_Y, "")
      .setDisplaySize(INFO_AVATAR_SIZE, INFO_AVATAR_SIZE)
      .setVisible(false);
    const name = createBitmapText(
      this,
      INFO_NAME_X,
      INFO_NAME_Y,
      "",
      FONT_HEADER,
    ).setVisible(false);

    const bars: Phaser.GameObjects.Rectangle[] = [];
    const values: Phaser.GameObjects.BitmapText[] = [];
    STAT_LABELS.forEach(({ label }, index) => {
      const rowY = STAT_FIRST_ROW_Y + index * STAT_ROW_GAP;
      createBitmapText(this, STAT_LABEL_X, rowY, label, FONT_BODY);
      // Track sits behind the fill so empty stat space stays visible.
      this.add.rectangle(
        STAT_BAR_LEFT + STAT_BAR_MAX_WIDTH / 2,
        rowY,
        STAT_BAR_MAX_WIDTH,
        STAT_BAR_HEIGHT,
        GAME_PALETTE.PERIWINKLE,
      );
      const fill = this.add
        .rectangle(STAT_BAR_LEFT, rowY, 0, STAT_BAR_HEIGHT, GAME_PALETTE.ROSE)
        .setOrigin(0, 0.5)
        .setVisible(false);
      const value = createBitmapText(
        this,
        STAT_VALUE_X,
        rowY,
        "",
        FONT_BODY,
      ).setVisible(false);
      bars.push(fill);
      values.push(value);
    });

    this.info = { avatar, name, placeholder, bars, values };
  }

  private buildControls(): void {
    const rowY = GAME_HEIGHT - 22;

    // Status sits on the left; the actions group to the right so the bottom
    // strip reads "info | actions" and has room to breathe.
    createButton(this, GRID_LEFT + 42, rowY, "Leave", {
      width: 84,
      fill: GAME_PALETTE.ORCHID,
      onClick: () => fadeToScene(this, START_SCENE_KEY),
    });

    this.status = createBitmapText(this, 206, rowY, "", FONT_BODY).setOrigin(
      0.5,
      0.5,
    );

    this.flightButton = createButton(this, 388, rowY, "Flight or Fight", {
      width: 160,
      fill: GAME_PALETTE.ROSE,
      onClick: () => this.confirm(),
    });
  }

  private toggle(character: GameCharacter): void {
    if (this.awaitingOpponent) {
      return;
    }

    this.selected = toggleSelection(this.selected, character.id, MAX_ROSTER);
    this.updateInfo(character);
    this.refresh();
  }

  private updateInfo(character: GameCharacter): void {
    if (!this.info) {
      return;
    }

    this.info.placeholder.setVisible(false);
    this.info.avatar
      .setTexture(avatarTextureKey(character.id))
      .setDisplaySize(INFO_AVATAR_SIZE, INFO_AVATAR_SIZE)
      .setVisible(true);
    this.info.name.setVisible(true).setText(character.name);

    STAT_LABELS.forEach(({ key }, index) => {
      const value = character.stats[key];
      const fill = this.info?.bars[index];
      const label = this.info?.values[index];
      fill
        ?.setVisible(true)
        .setSize((value / MAX_STAT) * STAT_BAR_MAX_WIDTH, STAT_BAR_HEIGHT);
      label?.setVisible(true).setText(`${value}`);
    });
  }

  private refresh(): void {
    this.cards.forEach((card, id) => {
      const position = this.selected.indexOf(id);
      const isSelected = position !== -1;
      card.background.setFillStyle(
        isSelected ? GAME_PALETTE.ROSE : GAME_PALETTE.LAVENDER,
      );
      card.badge.setVisible(isSelected);
      card.order.setVisible(isSelected).setText(`${position + 1}`);
    });

    this.updateStatus();
  }

  private updateStatus(): void {
    const ready = this.selected.length === MAX_ROSTER;

    if (this.awaitingOpponent) {
      this.status?.setText("Waiting for opponent...");
      this.flightButton?.setAlpha(0.4);
      return;
    }

    this.status?.setText(
      ready
        ? "Roster locked!"
        : `Selected ${this.selected.length}/${MAX_ROSTER}`,
    );
    this.flightButton?.setAlpha(ready ? 1 : 0.4);
  }

  private confirm(): void {
    if (this.awaitingOpponent || this.selected.length !== MAX_ROSTER) {
      return;
    }

    if (!this.opponentReady) {
      // Opponent still picking — hold here until they lock in.
      this.awaitingOpponent = true;
      this.updateStatus();
      return;
    }

    this.startFight();
  }

  private onOpponentReady(): void {
    this.opponentReady = true;
    if (this.awaitingOpponent) {
      this.startFight();
    }
  }

  private startFight(): void {
    fadeToScene(this, FIGHT_SCENE_KEY, {
      mode: this.mode,
      roster: this.selected,
      session: this.session,
    });
  }
}
