import Phaser from "phaser";
import type { CharacterResponse } from "@/services/api/schemas/character";
import type { Session } from "@/services/game/schemas/game";
import {
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
  MAX_ROSTER,
  MAX_STAT,
  TEXT_COLOR_NUMBER,
} from "../GameRenderer.constants";
import type {
  CharacterSelectSceneData,
  SessionInfo,
} from "../GameRenderer.types";
import { avatarTextureKey } from "../utils/avatar/generateAvatar";
import { toDisplayName } from "../utils/character/toDisplayName";
import { darkenColor } from "../utils/color/darkenColor";
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

const STAT_LABELS: { key: keyof CharacterResponse["stats"]; label: string }[] =
  [
    { key: "health", label: "HP" },
    { key: "power", label: "PWR" },
    { key: "intelligence", label: "INT" },
    { key: "defense", label: "DEF" },
  ];

interface CardView {
  background: Phaser.GameObjects.Rectangle;
  parts: Phaser.GameObjects.Rectangle[];
  avatar: Phaser.GameObjects.Image;
  nameLabel: Phaser.GameObjects.BitmapText;
  badge: Phaser.GameObjects.Rectangle;
  order: Phaser.GameObjects.BitmapText;
  colorTween?: Phaser.Tweens.Tween;
}

interface InfoView {
  avatar: Phaser.GameObjects.Image;
  name: Phaser.GameObjects.BitmapText;
  placeholder: Phaser.GameObjects.BitmapText;
  statLabels: Phaser.GameObjects.BitmapText[];
  tracks: Phaser.GameObjects.Rectangle[];
  bars: Phaser.GameObjects.Rectangle[];
  values: Phaser.GameObjects.BitmapText[];
}

export class CharacterSelectScene extends Phaser.Scene {
  private mode: CharacterSelectSceneData["mode"] = "single";
  private characters: CharacterResponse[] = [];
  private session?: SessionInfo;
  private selected: string[] = [];
  private opponentRoster: string[] = [];
  private selectionLocked = false;
  private opponentReady = true;
  private awaitingOpponent = false;
  private cards = new Map<string, CardView>();
  private info?: InfoView;
  private status?: Phaser.GameObjects.BitmapText;
  private flightButton?: Phaser.GameObjects.Container;
  private readySession?: Session;
  private unsubscribeSession?: () => void;
  private unsubscribeCharacters?: () => void;

  constructor() {
    super(CHARACTER_SELECT_SCENE_KEY);
  }

  create(data: CharacterSelectSceneData): void {
    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      GAME_PALETTE.PERIWINKLE,
    );
    this.mode = data.mode;
    this.characters = data.characters;
    this.session = data.session;
    this.selected = [];
    this.selectionLocked = false;
    this.awaitingOpponent = false;
    // Single-player has no opponent to wait on, so it starts ready.
    this.opponentReady = data.mode === "single";
    this.cards = new Map();

    this.cameras.main.fadeIn(350, 174, 158, 225);

    const heading = createBitmapText(
      this,
      GRID_LEFT,
      20,
      `Choose ${MAX_ROSTER} Fighters`,
      FONT_TITLE,
    )
      .setOrigin(0, 0.5)
      .setLeftAlign();
    heading.setAlpha(0);
    this.tweens.add({ targets: heading, alpha: 1, duration: 400, delay: 80 });

    const subtitle = createBitmapText(
      this,
      GRID_LEFT,
      36,
      "Pick order sets your fight sequence",
      FONT_BODY,
      GAME_PALETTE.LAVENDER,
    )
      .setOrigin(0, 0.5)
      .setLeftAlign();
    subtitle.setAlpha(0);
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 400, delay: 200 });

    this.buildGrid();
    this.buildInfoPanel();
    this.buildControls();

    if (this.mode === "multiplayer" && this.session?.gameService) {
      this.unsubscribeSession = this.session.gameService.onReady((session) => {
        this.readySession = session;
        this.onOpponentReady();
      });
      this.unsubscribeCharacters = this.session.gameService.onCharactersUpdated(
        (characters) => {
          this.opponentRoster = characters.map((c) => c.type);
        },
      );
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());

    this.refresh();
  }

  private buildGrid(): void {
    this.characters.forEach((character, index) => {
      const column = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);
      const x = GRID_LEFT + CELL_WIDTH / 2 + column * (CELL_WIDTH + GRID_GAP_X);
      const y = GRID_TOP + row * (CELL_HEIGHT + GRID_GAP_Y);

      const { base: background, parts: cardParts } = createPanel(
        this,
        x,
        y,
        CELL_WIDTH,
        CELL_HEIGHT,
        GAME_PALETTE.LAVENDER,
      );
      background.setInteractive({ useHandCursor: true });

      // Generated placeholder avatar standing in for real character art.
      const avatar = this.add
        .image(x, y + AVATAR_OFFSET_Y, avatarTextureKey(character.type))
        .setDisplaySize(AVATAR_SIZE, AVATAR_SIZE);
      const nameLabel = createBitmapText(
        this,
        x,
        y + NAME_OFFSET_Y,
        toDisplayName(character.type),
        FONT_BODY,
      );

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

      this.cards.set(character.type, {
        background,
        parts: cardParts,
        avatar,
        nameLabel,
        badge,
        order,
      });

      // Stagger entrance: each row arrives 90ms after the previous, columns
      // within a row fan in 20ms apart. Alpha-only (no y-offset) keeps the
      // bevel strips — which are separate scene objects — in sync.
      const staggerDelay = row * 90 + (index % COLUMNS) * 20 + 250;
      for (const part of cardParts) part.setAlpha(0);
      avatar.setAlpha(0);
      nameLabel.setAlpha(0);
      this.tweens.add({
        targets: [...cardParts, avatar, nameLabel],
        alpha: 1,
        duration: 300,
        ease: "Sine.easeOut",
        delay: staggerDelay,
      });
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
      "Hover a\nfighter\nto see\nstats",
      FONT_HEADER,
      GAME_PALETTE.LAVENDER,
    ).setCenterAlign();

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

    const statLabels: Phaser.GameObjects.BitmapText[] = [];
    const tracks: Phaser.GameObjects.Rectangle[] = [];
    const bars: Phaser.GameObjects.Rectangle[] = [];
    const values: Phaser.GameObjects.BitmapText[] = [];
    STAT_LABELS.forEach(({ label }, index) => {
      const rowY = STAT_FIRST_ROW_Y + index * STAT_ROW_GAP;
      const statLabel = createBitmapText(
        this,
        STAT_LABEL_X,
        rowY,
        label,
        FONT_BODY,
      ).setVisible(false);
      // Track sits behind the fill so empty stat space stays visible.
      const track = this.add
        .rectangle(
          STAT_BAR_LEFT + STAT_BAR_MAX_WIDTH / 2,
          rowY,
          STAT_BAR_MAX_WIDTH,
          STAT_BAR_HEIGHT,
          GAME_PALETTE.PERIWINKLE,
        )
        .setVisible(false);
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
      statLabels.push(statLabel);
      tracks.push(track);
      bars.push(fill);
      values.push(value);
    });

    this.info = { avatar, name, placeholder, statLabels, tracks, bars, values };
  }

  private buildControls(): void {
    const rowY = GAME_HEIGHT - 22;

    // Status sits on the left; the actions group to the right so the bottom
    // strip reads "info | actions" and has room to breathe.
    createButton(this, GRID_LEFT + 42, rowY, "Leave", {
      width: 84,
      fill: GAME_PALETTE.ORCHID,
      onClick: () => this.scene.start(START_SCENE_KEY),
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

  private toggle(character: CharacterResponse): void {
    if (this.awaitingOpponent || this.selectionLocked) {
      return;
    }

    const wasSelected = this.selected.includes(character.type);
    this.selected = toggleSelection(this.selected, character.type, MAX_ROSTER);
    this.updateInfo(character);
    this.refresh();

    const selectionChanged =
      this.selected.includes(character.type) !== wasSelected;
    const card = this.cards.get(character.type);
    if (card && selectionChanged) {
      const nowSelected = this.selected.includes(character.type);
      const fromColor = Phaser.Display.Color.IntegerToColor(
        nowSelected ? GAME_PALETTE.LAVENDER : GAME_PALETTE.ROSE,
      );
      const toColor = Phaser.Display.Color.IntegerToColor(
        nowSelected ? GAME_PALETTE.ROSE : GAME_PALETTE.LAVENDER,
      );
      card.colorTween?.stop();
      card.colorTween = this.tweens.addCounter({
        from: 0,
        to: 100,
        duration: 220,
        ease: "Sine.easeOut",
        onUpdate: (tween) => {
          const c = Phaser.Display.Color.Interpolate.ColorWithColor(
            fromColor,
            toColor,
            100,
            tween.getValue(),
          );
          card.background.setFillStyle(
            Phaser.Display.Color.GetColor(c.r, c.g, c.b),
          );
        },
      });
    }
  }

  private updateInfo(character: CharacterResponse): void {
    if (!this.info) {
      return;
    }

    this.info.placeholder.setVisible(false);
    this.info.avatar
      .setTexture(avatarTextureKey(character.type))
      .setDisplaySize(INFO_AVATAR_SIZE, INFO_AVATAR_SIZE)
      .setVisible(true);
    this.info.name.setVisible(true).setText(toDisplayName(character.type));

    STAT_LABELS.forEach(({ key }, index) => {
      const value = character.stats[key];
      this.info?.statLabels[index]?.setVisible(true);
      this.info?.tracks[index]?.setVisible(true);
      this.info?.values[index]?.setVisible(true).setText(`${value}`);

      const bar = this.info?.bars[index];
      if (bar) {
        bar.setVisible(true).setSize(0, STAT_BAR_HEIGHT);
        this.tweens.add({
          targets: bar,
          width: (value / MAX_STAT) * STAT_BAR_MAX_WIDTH,
          duration: 280,
          ease: "Cubic.easeOut",
          delay: index * 35,
        });
      }
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

    this.status
      ?.setText(
        ready
          ? "Roster locked!"
          : `Selected ${this.selected.length}/${MAX_ROSTER}`,
      )
      .setTint(ready ? TEXT_COLOR_NUMBER : GAME_PALETTE.RED);
    this.flightButton?.setAlpha(ready ? 1 : 0.4);
  }

  private confirm(): void {
    if (this.awaitingOpponent || this.selected.length !== MAX_ROSTER) {
      return;
    }

    this.hideUnselectedCards();

    if (this.selected.length === MAX_ROSTER && this.mode === "multiplayer") {
      this.selectionLocked = true;
      this.session?.gameService?.selectCharacters(this.selected);
    }

    if (!this.opponentReady) {
      // Opponent still picking — hold here until they lock in.
      this.awaitingOpponent = true;
      this.updateStatus();
      return;
    }

    this.startFight();
  }

  private hideUnselectedCards(): void {
    this.cards.forEach((card, id) => {
      if (!this.selected.includes(id)) {
        const targets = [
          card.background,
          ...card.parts,
          card.avatar,
          card.nameLabel,
        ];
        this.tweens.add({
          targets,
          alpha: 0,
          duration: 250,
          ease: "Sine.easeIn",
        });
      }
    });
  }

  private onOpponentReady(): void {
    this.opponentReady = true;
    if (this.awaitingOpponent) {
      this.startFight();
    }
  }

  private startFight(): void {
    this.scene.start(FIGHT_SCENE_KEY, {
      mode: this.mode,
      characters: this.characters,
      roster: this.selected,
      opponentRoster:
        this.opponentRoster.length > 0 ? this.opponentRoster : undefined,
      session: this.session,
      attackingPlayerId: this.readySession?.currentlyAttackingPlayerId,
    });
  }

  private cleanup(): void {
    this.unsubscribeSession?.();
    this.unsubscribeCharacters?.();
  }
}
