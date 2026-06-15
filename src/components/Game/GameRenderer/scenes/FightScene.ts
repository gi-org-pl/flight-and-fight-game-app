import Phaser from "phaser";
import { QTE_DEFINITIONS } from "@/constants/qte";
import type {
  CharacterResponse,
  CharacterType,
} from "@/services/api/schemas/character";
import type { GameService } from "@/services/game/gameService";
import { qteBridge } from "@/services/game/qteBridge";
import {
  QTE_MULTIPLIER_MAX,
  QTE_MULTIPLIER_MIN,
} from "@/services/game/schemas/game";
import type { QteDefinition } from "@/types/qte";
import {
  GAME_BITMAP_FONT,
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
  MAX_ROSTER,
  MUSIC_KEY_FIGHT,
} from "../GameRenderer.constants";
import type { Fighter, FightSceneData, FightSide } from "../GameRenderer.types";
import { spriteTextureKey } from "../utils/avatar/characterAssets";
import { chooseEnemyTarget } from "../utils/combat/chooseEnemyTarget";
import { computeDamage } from "../utils/combat/computeDamage";
import { createEnemyRoster } from "../utils/combat/createEnemyRoster";
import { createFighter } from "../utils/combat/createFighter";
import { isAlive, isTeamDefeated } from "../utils/combat/nextAliveIndex";
import { spawnSuperpowerEffect } from "../utils/combat/spawnSuperpowerEffect";
import { wedgePositions } from "../utils/layout/wedgePositions";
import { playMusic, stopMusic } from "../utils/sound/musicManager";
import { playAttackSound } from "../utils/sound/playAttackSound";
import { playFightStartSound } from "../utils/sound/playFightStartSound";
import { playHealthDownSound } from "../utils/sound/playHealthDownSound";
import { playLowHealthSound } from "../utils/sound/playLowHealthSound";
import { playSuperpowerSound } from "../utils/sound/playSuperpowerSound";
import { createBitmapText } from "../utils/text/createBitmapText";
import { createButton } from "../utils/widgets/createButton";
import { FIGHT_SCENE_KEY, WINNER_SCENE_KEY } from "./sceneKeys";

const FONT_TITLE = 16;
const FONT_BODY = 8;
const FONT_ROUND_NUM = 14;

// --- Round panel (top-centre) -----------------------------------------------
const ROUND_NUM_W = 26;
const ROUND_LABEL_W = 60;
const ROUND_PANEL_H = 20;
const ROUND_PANEL_Y = 4;
const ROUND_BANNER_H = 10;

// --- Formation (chevron wedge, per design) ----------------------------------
const VS_Y = 154;
const AVATAR_SIZE = 28;
const LEADER_AVATAR_SIZE = 38;

// --- Per-fighter elements, in container-local coords (0,0 = fighter centre) -
const HP_BAR_WIDTH = 32;
const HP_BAR_HEIGHT = 4;
const HP_BAR_OFFSET_Y = 22;
const NAME_OFFSET_Y = 30;
const FRAME_PADDING = 6;

// --- Fighter highlight (halo ellipse behind sprite) -------------------------
const HIGHLIGHT_OFFSET_Y = 3; // nudge down so the halo sits under the bird
const HIGHLIGHT_H_RATIO = 0.72; // ellipse height relative to width (squashed shadow)
const HIGHLIGHT_LEADER_ALPHA = 0.5;
const HIGHLIGHT_TARGET_ALPHA_MIN = 0.28;
const HIGHLIGHT_TARGET_ALPHA_MAX = 0.62;
const HIGHLIGHT_PULSE_DURATION = 540; // ms per half-cycle
const HIGHLIGHT_FADE_IN_MS = 280;
const HIGHLIGHT_FADE_OUT_MS = 200;

// --- Team HP banners (top corners) ------------------------------------------
const TEAM_LABEL_Y = 10;
const TEAM_BAR_Y = 20;
const TEAM_BAR_WIDTH = 150;
const TEAM_BAR_HEIGHT = 8;
const PLAYER_BAR_X = 88;
const ENEMY_BAR_X = GAME_WIDTH - 88;

// --- Visual / timing --------------------------------------------------------
const LIVE_TINT = 0xff_ff_ff;
const ENEMY_TURN_DELAY_MS = 900;

// --- Superpower -------------------------------------------------------------
const SUPERPOWER_MAX_USES = 3;

// --- Round panel animations -------------------------------------------------
const YOUR_TURN_SLIDE_MS = 240;
const YOUR_TURN_FADE_MS = 180;
const ROUND_PANEL_DEPTH = 2; // above the YOUR TURN strip so it hides behind the panel
const ROUND_NUM_SLIDE_Y = 6;
const ROUND_NUM_FADE_MS = 220;

// --- Toast notification -----------------------------------------------------
const TOAST_X = 8;
const TOAST_Y = 248;
const TOAST_ENTER_Y = 260;
const TOAST_EXIT_Y = 236;
const TOAST_MAX_W = 200;
const TOAST_PADDING_X = 8;
const TOAST_PADDING_Y = 5;
const TOAST_FADE_IN_MS = 220;
const TOAST_HOLD_MS = 1800;
const TOAST_HOLD_MIN_MS = 300;
const TOAST_FADE_OUT_MS = 380;
const TOAST_DEPTH = 10;

// --- HP drain animation -----------------------------------------------------
const HP_DRAIN_DELAY = 500;
const HP_DRAIN_DURATION = 380;
const HP_TRACK_ALPHA = 0.45;

// --- Vignette ---------------------------------------------------------------
const VIGNETTE_BORDER = 30;
const VIGNETTE_LOW_HP = 0.35; // threshold below which ambient vignette appears
const VIGNETTE_AMBIENT_MAX = 0.42; // alpha at 0 HP
const VIGNETTE_FLASH_ALPHA = 0.68; // spike alpha on player hit
const VIGNETTE_FLASH_DURATION = 780;
const VIGNETTE_PULSE_SPEED = 0.0028; // rad/ms → ~2.2 s cycle (danger heartbeat feel)
const VIGNETTE_PULSE_AMP = 0.22;

// --- Animation --------------------------------------------------------------
const MOVE_DURATION = 350;
const MOVE_EASE = "Cubic.Out";

// --- Clash animation (leaders meet at top-centre before trading blows) ------
const CLASH_Y = 90;
const CLASH_PLAYER_X = 200;
const CLASH_ENEMY_X = 280;
// Phase durations (ms)
const CLASH_APPROACH_DURATION = 420;
const CLASH_FACEOFF_PAUSE = 110;
const CLASH_WINDUP_DURATION = 210;
const CLASH_STRIKE_DURATION = 110;
const CLASH_IMPACT_HOLD = 120;
const CLASH_RECOIL_DURATION = 200;
const CLASH_RETURN_DURATION = 300;
// Tilt angles (degrees, positive = clockwise)
const CLASH_APPROACH_TILT = 12;
const CLASH_WINDUP_TILT = 20;
const CLASH_STRIKE_TILT = 33;
const CLASH_GUARD_TILT = 10;
const CLASH_RECOIL_TILT = 30;
const CLASH_SETTLE_ATK_TILT = 14;
const CLASH_SETTLE_DEF_TILT = 10;
// Position offsets & scale
const CLASH_LUNGE_OVERSHOOT = 22;
const CLASH_KNOCKBACK = 20;
const CLASH_IMPACT_SCALE = 1.18;
// Impact flash: scale punch before tumbling.
const IMPACT_SCALE = 1.3;
const IMPACT_DURATION = 70;
// Tumble fall: spin + drift sideways (away from centre) + gravity.
const TUMBLE_DURATION = 720;
const TUMBLE_EASE = "Cubic.In";
const TUMBLE_DRIFT_X = 28; // px horizontal drift away from the centre line
const TUMBLE_SPIN = 300; // degrees — slightly less than a full rotation
// Subtle idle wander: slow figure-eight with golden-ratio phase spacing so
// every fighter drifts independently.
const WANDER_AMP = 2.5; // px in 480×270 space
const WANDER_SPEED_X = 0.0009; // rad/ms → ~7 s period
const WANDER_SPEED_Y = 0.0006; // rad/ms → ~10 s period
const PHASE_STEP = 2.399; // ≈ 2π/φ

interface FighterView {
  container: Phaser.GameObjects.Container;
  avatar: Phaser.GameObjects.Sprite;
  frame: Phaser.GameObjects.Ellipse;
  framePulseTween?: Phaser.Tweens.Tween;
  frameState: "hidden" | "leader" | "target";
  hpFill: Phaser.GameObjects.Rectangle;
  hpDrain: Phaser.GameObjects.Rectangle;
  prevHealth: number;
  // anchorX/Y: live position (tweened). update() adds the wander offset on top.
  anchorX: number;
  anchorY: number;
  // targetX/Y: intended final anchor — prevents redundant tweens when
  // refresh() is called several times while a move is in-flight.
  targetX: number;
  targetY: number;
  phase: number;
  moveTween?: Phaser.Tweens.Tween;
  fallen: boolean; // death fall has been triggered
}

interface TeamBanner {
  fill: Phaser.GameObjects.Rectangle;
  drain: Phaser.GameObjects.Rectangle;
  prevWidth: number;
}

export class FightScene extends Phaser.Scene {
  private playerTeam: Fighter[] = [];
  private enemyTeam: Fighter[] = [];
  private playerViews: FighterView[] = [];
  private enemyViews: FighterView[] = [];
  private playerBanner?: TeamBanner;
  private enemyBanner?: TeamBanner;

  // Formation orders: the fighter at index 0 is always the current leader
  // (placed at the apex). After each attack the leader rotates to the back so
  // the next fighter steps forward — a clock-wise cycling queue.
  private playerOrder: number[] = [];
  private enemyOrder: number[] = [];

  private selectedTarget: number | null = null;
  private turn: FightSide = "player";
  private round = 1;
  private resolved = false;
  private animating = false;

  private gameService?: GameService;
  private myPlayerId?: string;
  private awaitingServer = false;
  // Set by the attacker path in subscribeToGameEvents; called by onTurnChanged
  // once the server confirms the defender submitted their action.
  private pendingStrikeCallback?: () => void;
  private pendingSuperpower = false;

  private opponentLabel = "Computer";
  private toastQueue: string[] = [];
  private toastBusy = false;
  private roundNumText?: Phaser.GameObjects.BitmapText;
  private roundNumMidY = 0;
  private prevRoundDisplayed = 1;
  private yourTurnBg?: Phaser.GameObjects.Rectangle;
  private yourTurnText?: Phaser.GameObjects.BitmapText;
  private yourTurnVisibleY = 0;
  private prevShowYourTurn = false;
  private attackButton?: Phaser.GameObjects.Container;
  private superpowerButton?: Phaser.GameObjects.Container;
  private superpowerChargePips: Phaser.GameObjects.Rectangle[] = [];
  private prevSuperpowerReady = false;
  private superpowerCharges = SUPERPOWER_MAX_USES;

  private vignetteAmbient?: Phaser.GameObjects.Graphics;
  private vignetteFlash?: Phaser.GameObjects.Rectangle;
  private superpowerFlash?: Phaser.GameObjects.Rectangle;
  private vignetteBaseAlpha = 0;
  private prevPlayerHpRatio = 1;
  private lowHealthLoop?: Phaser.Time.TimerEvent;

  constructor() {
    super(FIGHT_SCENE_KEY);
  }

  create(data: FightSceneData): void {
    this.cameras.main.fadeIn(350, 174, 158, 225);
    this.resetState(data);
    if (this.gameService) {
      this.subscribeToGameEvents();
    }

    this.add
      .rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        GAME_PALETTE.PERIWINKLE,
      )
      .setAlpha(0.9);

    createBitmapText(this, GAME_WIDTH / 2, VS_Y, "VS", FONT_TITLE);
    this.buildRoundPanel();

    this.buildBanners();
    this.buildFormation("player", this.playerTeam, this.playerViews);
    this.buildFormation("enemy", this.enemyTeam, this.enemyViews);
    this.buildControls();
    this.buildVignette();

    playMusic(this, MUSIC_KEY_FIGHT);

    this.refresh();
    playFightStartSound(this);
    this.showToast(">> Pick a target & attack!");
  }

  update(time: number): void {
    this.applyWander(this.playerViews, this.playerTeam, time);
    this.applyWander(this.enemyViews, this.enemyTeam, time);
    this.applyVignetteAmbient(time);
  }

  // --- Wander ----------------------------------------------------------------

  private applyWander(
    views: FighterView[],
    team: Fighter[],
    time: number,
  ): void {
    for (let index = 0; index < views.length; index += 1) {
      const view = views[index];
      if (!isAlive(team[index]) || view.fallen) {
        // Dead fighters are handled by their fall tween; skip wander.
        continue;
      }
      const wx = Math.sin(time * WANDER_SPEED_X + view.phase) * WANDER_AMP;
      const wy =
        Math.cos(time * WANDER_SPEED_Y + view.phase * 1.3) * WANDER_AMP;
      view.container.setPosition(view.anchorX + wx, view.anchorY + wy);
    }
  }

  // --- Setup -----------------------------------------------------------------

  private resetState(data: FightSceneData): void {
    this.opponentLabel = data.mode === "multiplayer" ? "Opponent" : "Computer";

    const byId = new Map(
      data.characters.map((character) => [character.type, character]),
    );
    const playerCharacters = data.roster
      .map((id) => byId.get(id as CharacterType))
      .filter((character): character is CharacterResponse =>
        Boolean(character),
      );

    this.playerTeam = playerCharacters.map(createFighter);

    const enemyCharacters = data.opponentRoster
      ? data.opponentRoster
          .map((id) => byId.get(id as CharacterType))
          .filter((c): c is CharacterResponse => Boolean(c))
      : createEnemyRoster(data.characters, data.roster, MAX_ROSTER);
    this.enemyTeam = enemyCharacters.map(createFighter);

    this.playerViews = [];
    this.enemyViews = [];
    // Initial formation order: 0, 1, 2, … roster length.
    this.playerOrder = this.playerTeam.map((_, i) => i);
    this.enemyOrder = this.enemyTeam.map((_, i) => i);
    this.gameService = data.session?.gameService;
    this.myPlayerId = data.session?.playerId;
    this.awaitingServer = false;
    this.selectedTarget = null;
    this.turn =
      data.mode === "multiplayer" && data.attackingPlayerId !== undefined
        ? data.attackingPlayerId === this.myPlayerId
          ? "player"
          : "enemy"
        : "player";
    this.round = 1;
    this.resolved = false;
    this.superpowerCharges = SUPERPOWER_MAX_USES;
    this.prevSuperpowerReady = false;
    this.prevRoundDisplayed = 1;
    this.prevShowYourTurn = false;
  }

  // --- Build -----------------------------------------------------------------

  private buildRoundPanel(): void {
    const totalW = ROUND_NUM_W + ROUND_LABEL_W;
    const leftEdge = GAME_WIDTH / 2 - totalW / 2;
    const midY = ROUND_PANEL_Y + ROUND_PANEL_H / 2;

    this.add
      .rectangle(
        leftEdge,
        ROUND_PANEL_Y,
        ROUND_NUM_W,
        ROUND_PANEL_H,
        GAME_PALETTE.MAUVE,
      )
      .setOrigin(0, 0)
      .setDepth(ROUND_PANEL_DEPTH);
    this.add
      .rectangle(
        leftEdge + ROUND_NUM_W,
        ROUND_PANEL_Y,
        ROUND_LABEL_W,
        ROUND_PANEL_H,
        GAME_PALETTE.LAVENDER,
      )
      .setOrigin(0, 0)
      .setDepth(ROUND_PANEL_DEPTH);

    this.roundNumMidY = midY;
    this.roundNumText = this.add
      .bitmapText(
        leftEdge + ROUND_NUM_W / 2,
        midY,
        GAME_BITMAP_FONT,
        "1",
        FONT_ROUND_NUM,
      )
      .setOrigin(0.5)
      .setDepth(ROUND_PANEL_DEPTH);
    this.add
      .bitmapText(
        leftEdge + ROUND_NUM_W + ROUND_LABEL_W / 2,
        midY,
        GAME_BITMAP_FONT,
        "Round",
        FONT_BODY,
      )
      .setOrigin(0.5)
      .setDepth(ROUND_PANEL_DEPTH);

    const bannerY = ROUND_PANEL_Y + ROUND_PANEL_H;
    this.yourTurnVisibleY = bannerY;
    // Start retracted (above bannerY, hidden behind the round panel).
    const hiddenY = bannerY - ROUND_BANNER_H;
    this.yourTurnBg = this.add
      .rectangle(leftEdge, hiddenY, totalW, ROUND_BANNER_H, GAME_PALETTE.ORANGE)
      .setOrigin(0, 0)
      .setAlpha(0);
    this.yourTurnText = this.add
      .bitmapText(
        GAME_WIDTH / 2,
        hiddenY + ROUND_BANNER_H / 2,
        GAME_BITMAP_FONT,
        "YOUR TURN",
        FONT_BODY,
      )
      .setOrigin(0.5)
      .setAlpha(0);
  }

  private buildBanners(): void {
    this.playerBanner = this.buildBanner(PLAYER_BAR_X, "You");
    this.enemyBanner = this.buildBanner(ENEMY_BAR_X, this.opponentLabel);
  }

  private buildBanner(x: number, name: string): TeamBanner {
    this.add
      .rectangle(
        x,
        ROUND_PANEL_Y,
        TEAM_BAR_WIDTH,
        ROUND_PANEL_H,
        GAME_PALETTE.LAVENDER,
      )
      .setOrigin(0.5, 0);
    createBitmapText(this, x, TEAM_LABEL_Y, name, FONT_BODY);
    this.add
      .rectangle(x, TEAM_BAR_Y, TEAM_BAR_WIDTH, TEAM_BAR_HEIGHT, 0x00_00_00)
      .setAlpha(HP_TRACK_ALPHA);
    const drain = this.add
      .rectangle(
        x - TEAM_BAR_WIDTH / 2,
        TEAM_BAR_Y,
        TEAM_BAR_WIDTH,
        TEAM_BAR_HEIGHT,
        GAME_PALETTE.RED,
      )
      .setOrigin(0, 0.5);
    const fill = this.add
      .rectangle(
        x - TEAM_BAR_WIDTH / 2,
        TEAM_BAR_Y,
        TEAM_BAR_WIDTH,
        TEAM_BAR_HEIGHT,
        GAME_PALETTE.GREEN,
      )
      .setOrigin(0, 0.5);

    return { fill, drain, prevWidth: TEAM_BAR_WIDTH };
  }

  private buildFormation(
    side: FightSide,
    team: Fighter[],
    views: FighterView[],
  ): void {
    const order = side === "player" ? this.playerOrder : this.enemyOrder;
    const assignment = this.computeSlotAssignment(order, side);

    for (let index = 0; index < team.length; index += 1) {
      const fighter = team[index];
      const fallbackX = side === "player" ? 52 : GAME_WIDTH - 52;
      const pos = assignment.get(index) ?? { x: fallbackX, y: VS_Y };

      const frameW = AVATAR_SIZE + FRAME_PADDING;
      const frame = this.add
        .ellipse(
          0,
          HIGHLIGHT_OFFSET_Y,
          frameW,
          frameW * HIGHLIGHT_H_RATIO,
          GAME_PALETTE.BLUSH,
        )
        .setAlpha(0)
        .setVisible(false);

      const animKey = spriteTextureKey(fighter.id);
      const anim = this.anims.get(animKey);
      const frameCount = anim?.frames.length ?? 1;
      const baseRate = anim?.frameRate ?? 2;
      // Each bird gets a ±25 % speed jitter and a random starting frame so
      // the flock never flaps in perfect unison.
      const frameRate = baseRate * (0.75 + Math.random() * 0.5);
      const startFrame = Math.floor(Math.random() * frameCount);

      const avatar = this.add
        .sprite(0, 0, animKey)
        .setDisplaySize(AVATAR_SIZE, AVATAR_SIZE)
        .play({ key: animKey, frameRate, startFrame, repeat: -1 })
        .setFlipX(side === "enemy");

      const hpTrack = this.add
        .rectangle(0, HP_BAR_OFFSET_Y, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0x00_00_00)
        .setAlpha(HP_TRACK_ALPHA);
      const hpDrain = this.add
        .rectangle(
          -HP_BAR_WIDTH / 2,
          HP_BAR_OFFSET_Y,
          HP_BAR_WIDTH,
          HP_BAR_HEIGHT,
          GAME_PALETTE.RED,
        )
        .setOrigin(0, 0.5);
      const hpFill = this.add
        .rectangle(
          -HP_BAR_WIDTH / 2,
          HP_BAR_OFFSET_Y,
          HP_BAR_WIDTH,
          HP_BAR_HEIGHT,
          GAME_PALETTE.GREEN,
        )
        .setOrigin(0, 0.5);

      const nameText = this.add
        .bitmapText(0, NAME_OFFSET_Y, GAME_BITMAP_FONT, fighter.name, FONT_BODY)
        .setOrigin(0.5);

      const container = this.add.container(pos.x, pos.y, [
        frame,
        avatar,
        hpTrack,
        hpDrain,
        hpFill,
        nameText,
      ]);

      if (side === "enemy") {
        avatar.setInteractive({ useHandCursor: true });
        avatar.on("pointerdown", () => this.selectTarget(index));
      }

      views.push({
        container,
        avatar,
        frame,
        hpFill,
        hpDrain,
        prevHealth: fighter.maxHealth,
        anchorX: pos.x,
        anchorY: pos.y,
        targetX: pos.x,
        targetY: pos.y,
        phase: index * PHASE_STEP,
        fallen: false,
        frameState: "hidden",
      });
    }
  }

  private buildControls(): void {
    const ATTACK_W = 100;
    const SUPER_W = 140;
    const BTN_GAP = 10;
    const BTN_Y = GAME_HEIGHT - 20;
    const attackX = GAME_WIDTH - 58;
    const superpowerX = attackX - ATTACK_W / 2 - BTN_GAP - SUPER_W / 2;

    this.superpowerButton = createButton(
      this,
      superpowerX,
      BTN_Y,
      "Superpower",
      {
        width: SUPER_W,
        fontSize: 8,
        fill: GAME_PALETTE.ORANGE,
        onClick: () => this.superpower(),
      },
    );
    this.spawnSuperpowerParticles(superpowerX, BTN_Y, SUPER_W, 30);
    this.attackButton = createButton(this, attackX, BTN_Y, "Attack", {
      width: ATTACK_W,
      fill: GAME_PALETTE.ROSE,
      onClick: () => this.attack(),
    });

    // Charge pips — one square per max use, centred above the superpower button.
    const PIP_SIZE = 5;
    const PIP_GAP = 4;
    const pipsY = BTN_Y - 22;
    const totalPipsW =
      SUPERPOWER_MAX_USES * PIP_SIZE + (SUPERPOWER_MAX_USES - 1) * PIP_GAP;
    const pipsStartX = superpowerX - totalPipsW / 2 + PIP_SIZE / 2;
    this.superpowerChargePips = [];
    for (let i = 0; i < SUPERPOWER_MAX_USES; i += 1) {
      const pip = this.add
        .rectangle(
          pipsStartX + i * (PIP_SIZE + PIP_GAP),
          pipsY,
          PIP_SIZE,
          PIP_SIZE,
          GAME_PALETTE.ORANGE,
        )
        .setDepth(TOAST_DEPTH + 1);
      this.superpowerChargePips.push(pip);
    }
  }

  private syncChargePips(): void {
    const visible =
      !this.resolved && this.superpowerCharges > 0 && this.turn === "player";
    for (let i = 0; i < this.superpowerChargePips.length; i += 1) {
      this.superpowerChargePips[i].setVisible(visible);
      if (visible) {
        this.superpowerChargePips[i].setAlpha(
          i < this.superpowerCharges ? 1 : 0.2,
        );
      }
    }
  }

  private spawnSuperpowerParticles(
    cx: number,
    cy: number,
    w: number,
    h: number,
  ): void {
    // Step interval for discrete pixel-art motion (ms per pixel step).
    const STEP_MS = 80;
    const STEPS = 6;

    this.time.addEvent({
      delay: 200,
      loop: true,
      callback: () => {
        if (!this.sys.isActive() || this.superpowerCharges <= 0) return;
        for (let i = 0; i < 2; i += 1) {
          const angle = Math.random() * Math.PI * 2;
          const rx = Math.round(w / 2 + 4 + Math.random() * 6);
          const ry = Math.round(h / 2 + 4 + Math.random() * 4);
          const startX = Math.round(cx + Math.cos(angle) * rx);
          const startY = Math.round(cy + Math.sin(angle) * ry);
          const size = Math.random() > 0.5 ? 2 : 3;
          const color = Math.random() > 0.5 ? 0xf5_b7_70 : 0xff_d2_7f;
          const dx = Math.round(Math.cos(angle) * 12);
          const dy = Math.round(Math.sin(angle) * 12);
          const particle = this.add
            .rectangle(startX, startY, size, size, color)
            .setDepth(5);

          for (let step = 1; step <= STEPS; step += 1) {
            const s = step;
            this.time.delayedCall(s * STEP_MS, () => {
              if (!particle.active) return;
              if (s === STEPS) {
                particle.destroy();
                return;
              }
              // Snap to integer pixel positions each step.
              particle.setPosition(
                startX + Math.round((dx * s) / STEPS),
                startY + Math.round((dy * s) / STEPS),
              );
              // Two discrete alpha levels: full → half → gone.
              particle.setAlpha(s < STEPS / 2 ? 1 : 0.4);
            });
          }
        }
      },
    });
  }

  // --- Player turn -----------------------------------------------------------

  private selectTarget(index: number): void {
    if (this.turn !== "player" || this.resolved) {
      return;
    }
    if (!isAlive(this.enemyTeam[index])) {
      return;
    }

    this.selectedTarget = index;
    this.refresh();
    this.showToast(`[>] ${this.enemyTeam[index].name} targeted`);
  }

  private attack(): void {
    if (
      this.turn !== "player" ||
      this.resolved ||
      this.animating ||
      this.awaitingServer
    ) {
      return;
    }
    if (this.selectedTarget === null) {
      this.showToast("[!] Pick a target first");
      return;
    }

    if (this.gameService) {
      const attackingCharacter = this.playerTeam[this.playerOrder[0]].id;
      const attackedCharacter = this.enemyTeam[this.selectedTarget].id;
      this.awaitingServer = true;
      this.animating = true;
      this.refresh();
      this.gameService.attack({
        attackingCharacter: attackingCharacter as CharacterType,
        attackedCharacter: attackedCharacter as CharacterType,
        quickTimeEventMultiplier:
          QTE_MULTIPLIER_MIN +
          Math.random() * (QTE_MULTIPLIER_MAX - QTE_MULTIPLIER_MIN),
      });
      return;
    }

    const leadIndex = this.playerOrder[0];
    const attacker = this.playerTeam[leadIndex];
    const defender = this.enemyTeam[this.selectedTarget];
    const attackerView = this.playerViews[leadIndex];
    const defenderView = this.enemyViews[this.selectedTarget];

    this.animating = true;
    this.refresh();

    this.animateClash(
      attackerView,
      defenderView,
      "player",
      () =>
        spawnSuperpowerEffect(
          this,
          defenderView.anchorX,
          defenderView.anchorY,
          attacker.superpower,
        ),
      () => {
        this.applyHit(attacker, defender);
        this.showToast(
          `[X] ${attacker.name} -> ${defender.name}${isAlive(defender) ? "!" : " down!"}`,
        );
      },
      () => {
        this.animating = false;

        if (this.finishIfResolved()) {
          return;
        }

        this.rotateOrder("player");
        this.selectedTarget = null;
        this.turn = "enemy";
        this.refresh();

        this.time.delayedCall(ENEMY_TURN_DELAY_MS, () => this.enemyTurn());
      },
    );
  }

  private superpower(): void {
    if (this.turn !== "player" || this.resolved || this.animating) {
      return;
    }
    if (this.selectedTarget === null) {
      this.showToast("[!] Pick a target first");
      return;
    }
    if (this.superpowerCharges <= 0) {
      this.showToast("[!] No superpower charges left");
      return;
    }

    const leadIndex = this.playerOrder[0];
    const attacker = this.playerTeam[leadIndex];
    const defender = this.enemyTeam[this.selectedTarget];
    const attackerView = this.playerViews[leadIndex];
    const defenderView = this.enemyViews[this.selectedTarget];

    // Lock UI while QTE is active; for multiplayer also block server actions.
    this.animating = true;
    if (this.gameService) {
      this.awaitingServer = true;
    }
    this.refresh();

    const attackerQtes = QTE_DEFINITIONS.filter(
      (q): q is QteDefinition => q.role === "attacker",
    );
    const qte = attackerQtes[Math.floor(Math.random() * attackerQtes.length)];

    qteBridge.request(qte, (quality) => {
      if (!this.sys.isActive()) {
        this.animating = false;
        this.awaitingServer = false;
        return;
      }

      this.superpowerCharges -= 1;

      if (this.gameService) {
        // Multiplayer: send as a regular attack with the QTE-derived multiplier.
        // onAttacked will play the approach + strike; pendingSuperpower adds visual
        // effects (flash + sound) on impact.
        const multiplier =
          QTE_MULTIPLIER_MIN +
          quality * (QTE_MULTIPLIER_MAX - QTE_MULTIPLIER_MIN);
        this.pendingSuperpower = true;
        this.gameService.attack({
          attackingCharacter: attacker.id as CharacterType,
          attackedCharacter: defender.id as CharacterType,
          quickTimeEventMultiplier: Math.min(
            QTE_MULTIPLIER_MAX,
            Math.max(QTE_MULTIPLIER_MIN, multiplier),
          ),
        });
        return;
      }

      // Single-player: animate immediately; QTE quality scales damage.
      // quality 0 → base damage; quality 1 → 2.5× base (unchanged max).
      this.animateClash(
        attackerView,
        defenderView,
        "player",
        () =>
          spawnSuperpowerEffect(
            this,
            defenderView.anchorX,
            defenderView.anchorY,
            attacker.superpower,
          ),
        () => {
          this.flashSuperpower();
          playSuperpowerSound(this);
          playHealthDownSound(this);
          const base = computeDamage(attacker, defender);
          const superDamage = Math.max(
            5,
            Math.round(base * (1 + quality * 1.5)),
          );
          defender.health = Math.max(0, defender.health - superDamage);
          this.refresh();
          this.showToast(
            `[**] ${attacker.name} -> ${defender.name}${isAlive(defender) ? "!" : " down!"}`,
          );
        },
        () => {
          this.animating = false;

          if (this.finishIfResolved()) {
            return;
          }

          this.rotateOrder("player");
          this.selectedTarget = null;
          this.turn = "enemy";
          this.refresh();

          this.time.delayedCall(ENEMY_TURN_DELAY_MS, () => this.enemyTurn());
        },
      );
    });
  }

  // --- Enemy turn ------------------------------------------------------------

  private enemyTurn(): void {
    if (this.resolved || !this.sys.isActive()) {
      return;
    }

    const leadIndex = this.enemyOrder[0];
    const attacker = this.enemyTeam[leadIndex];
    const targetIndex = chooseEnemyTarget(this.playerTeam);
    const defender = this.playerTeam[targetIndex];
    const attackerView = this.enemyViews[leadIndex];
    const defenderView = this.playerViews[targetIndex];

    this.animating = true;

    this.animateClash(
      attackerView,
      defenderView,
      "enemy",
      () =>
        spawnSuperpowerEffect(
          this,
          defenderView.anchorX,
          defenderView.anchorY,
          attacker.superpower,
        ),
      () => {
        this.applyHit(attacker, defender);
        this.showToast(
          `[X] ${attacker.name} -> ${defender.name}${isAlive(defender) ? "!" : " down!"}`,
        );
      },
      () => {
        this.animating = false;

        if (this.finishIfResolved()) {
          return;
        }

        this.rotateOrder("enemy");
        this.turn = "player";
        this.round += 1;
        this.refresh();
      },
    );
  }

  // --- Shared ----------------------------------------------------------------

  private applyHit(attacker: Fighter, defender: Fighter): void {
    const damage = computeDamage(attacker, defender);
    defender.health = Math.max(0, defender.health - damage);
    playAttackSound(this, attacker.superpower);
    playHealthDownSound(this);
    this.refresh();
  }

  // Rotate the front fighter to the back of the queue then remove any dead
  // fighters so the next alive one is always at position 0.
  private rotateOrder(side: FightSide): void {
    const order = side === "player" ? this.playerOrder : this.enemyOrder;
    const team = side === "player" ? this.playerTeam : this.enemyTeam;
    const [leader, ...rest] = order;
    const rotated = [...rest, leader].filter((i) => isAlive(team[i]));

    if (side === "player") {
      this.playerOrder = rotated;
    } else {
      this.enemyOrder = rotated;
    }
  }

  private finishIfResolved(): boolean {
    if (this.resolved) return true;

    const playerDown = isTeamDefeated(this.playerTeam);

    // Multiplayer: both teams' health comes from the server via
    // `charactersUpdated`. A win is declared by the server closing the session
    // (see `onTurnChanged` state === 'CLOSED') — that is the authoritative
    // signal. Loss is caught here the moment `charactersUpdated` wipes my team.
    if (this.gameService) {
      if (!playerDown) {
        return false;
      }
      return this.finishWith(this.opponentLabel);
    }

    const enemyDown = isTeamDefeated(this.enemyTeam);
    if (!enemyDown && !playerDown) {
      return false;
    }
    return this.finishWith(enemyDown ? "You" : this.opponentLabel);
  }

  private finishWith(winner: string): boolean {
    if (this.resolved) return true;
    this.resolved = true;
    this.lowHealthLoop?.destroy();
    this.lowHealthLoop = undefined;
    this.refresh();
    stopMusic(this);
    this.time.delayedCall(ENEMY_TURN_DELAY_MS * 2, () => {
      if (this.sys.isActive()) {
        this.scene.start(WINNER_SCENE_KEY, { winner });
      }
    });
    return true;
  }

  private refresh(): void {
    // Strip dead fighters from both orders so the formation closes ranks.
    this.playerOrder = this.playerOrder.filter((i) =>
      isAlive(this.playerTeam[i]),
    );
    this.enemyOrder = this.enemyOrder.filter((i) => isAlive(this.enemyTeam[i]));

    // Clear a selected target that just died.
    if (
      this.selectedTarget !== null &&
      !isAlive(this.enemyTeam[this.selectedTarget])
    ) {
      this.selectedTarget = null;
    }

    this.syncTeam(
      this.playerTeam,
      this.playerViews,
      this.playerOrder,
      "player",
    );
    this.syncTeam(this.enemyTeam, this.enemyViews, this.enemyOrder, "enemy");
    this.syncBanner(this.playerBanner, this.playerTeam);
    this.syncBanner(this.enemyBanner, this.enemyTeam);

    if (this.round !== this.prevRoundDisplayed) {
      this.animateRoundNumber(this.prevRoundDisplayed, this.round);
      this.prevRoundDisplayed = this.round;
    }

    const showYourTurn = !this.resolved && this.turn === "player";
    if (showYourTurn !== this.prevShowYourTurn) {
      this.animateYourTurn(showYourTurn);
      this.prevShowYourTurn = showYourTurn;
    }

    const canAttack =
      !this.resolved &&
      !this.animating &&
      !this.awaitingServer &&
      this.turn === "player" &&
      this.selectedTarget !== null;
    this.attackButton?.setAlpha(canAttack ? 1 : 0.4);
    const superpowerOffCooldown =
      !this.resolved && this.superpowerCharges > 0 && this.turn === "player";
    this.syncChargePips();
    if (this.superpowerButton) {
      if (superpowerOffCooldown !== this.prevSuperpowerReady) {
        this.prevSuperpowerReady = superpowerOffCooldown;
        this.tweens.killTweensOf(this.superpowerButton);
        if (superpowerOffCooldown) {
          this.superpowerButton.setVisible(true).setAlpha(0);
          this.tweens.add({
            targets: this.superpowerButton,
            alpha: canAttack ? 1 : 0.4,
            duration: HIGHLIGHT_FADE_IN_MS,
            ease: "Cubic.Out",
          });
        } else {
          this.tweens.add({
            targets: this.superpowerButton,
            alpha: 0,
            duration: HIGHLIGHT_FADE_OUT_MS,
            ease: "Cubic.Out",
            onComplete: () => {
              this.superpowerButton?.setVisible(false);
            },
          });
        }
      } else if (superpowerOffCooldown) {
        this.superpowerButton.setAlpha(canAttack ? 1 : 0.4);
      }
    }

    const playerTotal = this.playerTeam.reduce((s, f) => s + f.maxHealth, 0);
    const playerCurrent = this.playerTeam.reduce((s, f) => s + f.health, 0);
    const playerRatio = playerTotal === 0 ? 0 : playerCurrent / playerTotal;
    const tookDamage = playerRatio < this.prevPlayerHpRatio;
    this.prevPlayerHpRatio = playerRatio;
    this.syncVignette(playerRatio, tookDamage);
  }

  // Compute slot positions from the ordered fighter queue. The fighter at
  // order[0] is always the leader and takes the apex (slot 0). Others fill
  // slots 1–4 in queue order, closing rank as fighters fall.
  private computeSlotAssignment(
    order: number[],
    side: FightSide,
  ): Map<number, { x: number; y: number }> {
    const slots = wedgePositions(5);
    const result = new Map<number, { x: number; y: number }>();

    for (let slotIndex = 0; slotIndex < order.length; slotIndex += 1) {
      if (slotIndex >= slots.length) {
        break;
      }
      const fighterIndex = order[slotIndex];
      const slot = slots[slotIndex];
      const x = side === "player" ? slot.x : GAME_WIDTH - slot.x;
      result.set(fighterIndex, { x, y: slot.y });
    }

    return result;
  }

  private syncTeam(
    team: Fighter[],
    views: FighterView[],
    order: number[],
    side: FightSide,
  ): void {
    const assignment = this.computeSlotAssignment(order, side);
    const leadIndex = order[0];
    const isEnemy = side === "enemy";

    for (let index = 0; index < team.length; index += 1) {
      const fighter = team[index];
      const view = views[index];

      if (!isAlive(fighter)) {
        // Trigger the struck-bird animation exactly once.
        if (!view.fallen) {
          view.fallen = true;
          view.frame.setVisible(false);
          view.moveTween?.stop();

          // Player side drifts left, enemy side drifts right — away from the
          // centre line, matching the direction the hit came from.
          const driftX = side === "player" ? -TUMBLE_DRIFT_X : TUMBLE_DRIFT_X;
          // Spin direction mirrors the drift so the tumble reads as a
          // physical reaction: struck from the right → tumbles left/CCW.
          const spin = side === "player" ? -TUMBLE_SPIN : TUMBLE_SPIN;

          // Phase 1 — impact flash: brief scale-up punch.
          this.tweens.add({
            targets: view.container,
            scaleX: IMPACT_SCALE,
            scaleY: IMPACT_SCALE,
            duration: IMPACT_DURATION,
            ease: "Quad.Out",
            yoyo: true,
            onComplete: () => {
              if (!this.sys.isActive()) return;
              // Phase 2 — tumble fall: spin + drift + gravity + fade.
              this.tweens.add({
                targets: view.container,
                x: view.container.x + driftX,
                y: GAME_HEIGHT + 80,
                angle: spin,
                scaleX: 0.35,
                scaleY: 0.35,
                alpha: 0,
                duration: TUMBLE_DURATION,
                ease: TUMBLE_EASE,
              });
            },
          });
        }
        continue;
      }

      const isLeader = index === leadIndex && !isEnemy;
      const isTarget =
        isEnemy && this.selectedTarget === index && !this.resolved;
      const size = isLeader ? LEADER_AVATAR_SIZE : AVATAR_SIZE;

      view.avatar.setDisplaySize(size, size);
      view.avatar.setTint(LIVE_TINT);

      const newWidth = (fighter.health / fighter.maxHealth) * HP_BAR_WIDTH;

      if (fighter.health < view.prevHealth) {
        const drainWidth = (view.prevHealth / fighter.maxHealth) * HP_BAR_WIDTH;
        view.hpDrain.setSize(drainWidth, HP_BAR_HEIGHT);
        this.tweens.killTweensOf(view.hpDrain);
        this.time.delayedCall(HP_DRAIN_DELAY, () => {
          if (!this.sys.isActive()) return;
          this.tweens.add({
            targets: view.hpDrain,
            width: newWidth,
            duration: HP_DRAIN_DURATION,
            ease: "Cubic.Out",
          });
        });
      }

      view.prevHealth = fighter.health;
      view.hpFill.setVisible(true).setSize(newWidth, HP_BAR_HEIGHT);
      const frameW = size + FRAME_PADDING;
      view.frame
        .setFillStyle(isTarget ? GAME_PALETTE.ROSE : GAME_PALETTE.ORANGE)
        .setSize(frameW, frameW * HIGHLIGHT_H_RATIO);

      const newFrameState: "hidden" | "leader" | "target" = isTarget
        ? "target"
        : isLeader
          ? "leader"
          : "hidden";

      if (newFrameState !== view.frameState) {
        view.frameState = newFrameState;

        if (view.framePulseTween) {
          view.framePulseTween.stop();
          view.framePulseTween = undefined;
        }
        this.tweens.killTweensOf(view.frame);

        if (newFrameState === "hidden") {
          view.frame.setVisible(true);
          this.tweens.add({
            targets: view.frame,
            alpha: 0,
            duration: HIGHLIGHT_FADE_OUT_MS,
            ease: "Cubic.Out",
            onComplete: () => {
              view.frame.setVisible(false);
            },
          });
        } else if (newFrameState === "leader") {
          view.frame.setVisible(true);
          this.tweens.add({
            targets: view.frame,
            alpha: HIGHLIGHT_LEADER_ALPHA,
            duration: HIGHLIGHT_FADE_IN_MS,
            ease: "Cubic.Out",
          });
        } else {
          // target: fade in then start pulse
          view.frame.setVisible(true);
          this.tweens.add({
            targets: view.frame,
            alpha: HIGHLIGHT_TARGET_ALPHA_MIN,
            duration: HIGHLIGHT_FADE_IN_MS,
            ease: "Cubic.Out",
            onComplete: () => {
              if (view.frameState !== "target") return;
              view.framePulseTween = this.tweens.add({
                targets: view.frame,
                alpha: {
                  from: HIGHLIGHT_TARGET_ALPHA_MIN,
                  to: HIGHLIGHT_TARGET_ALPHA_MAX,
                },
                duration: HIGHLIGHT_PULSE_DURATION,
                yoyo: true,
                repeat: -1,
                ease: "Sine.InOut",
              });
            },
          });
        }
      }

      // Animate to the new slot when the intended destination changed.
      // Skip repositioning while a clash animation is in progress — syncTeam
      // runs from refresh() which fires from onTurnChanged even mid-clash, and
      // stopping the moveTween would orphan the clashApproach onComplete,
      // leaving this.animating stuck true. The clash completion callback calls
      // refresh() again after animating = false, so fighters are repositioned
      // correctly once the animation concludes.
      const target = assignment.get(index);
      if (
        !this.animating &&
        target &&
        (target.x !== view.targetX || target.y !== view.targetY)
      ) {
        view.targetX = target.x;
        view.targetY = target.y;
        view.moveTween?.stop();
        view.moveTween = this.tweens.add({
          targets: view,
          anchorX: target.x,
          anchorY: target.y,
          duration: MOVE_DURATION,
          ease: MOVE_EASE,
        });
      }
    }
  }

  // Move both leaders to the upper-centre clash area, lunge toward each other
  // Multi-phase clash: approach → face-off → wind-up → strike → recoil → return.
  private animateClash(
    attackerView: FighterView,
    defenderView: FighterView,
    attackerSide: FightSide,
    onContact: () => void,
    onImpact: () => void,
    onComplete: () => void,
  ): void {
    this.clashApproach(attackerView, defenderView, attackerSide, () => {
      this.clashStrike(
        attackerView,
        defenderView,
        attackerSide,
        onContact,
        onImpact,
        onComplete,
      );
    });
  }

  // Phase 1: Move both fighters to the clash area. Calls onApproached when both arrive.
  private clashApproach(
    attackerView: FighterView,
    defenderView: FighterView,
    attackerSide: FightSide,
    onApproached: () => void,
  ): void {
    if (!this.sys.isActive()) return;

    const atkX = attackerSide === "player" ? CLASH_PLAYER_X : CLASH_ENEMY_X;
    const defX = attackerSide === "player" ? CLASH_ENEMY_X : CLASH_PLAYER_X;
    const dir = attackerSide === "player" ? 1 : -1;

    attackerView.targetX = atkX;
    attackerView.targetY = CLASH_Y;
    defenderView.targetX = defX;
    defenderView.targetY = CLASH_Y;

    attackerView.moveTween?.stop();
    defenderView.moveTween?.stop();

    let approached = 0;
    const onBothApproached = () => {
      approached += 1;
      if (approached < 2) return;
      if (!this.sys.isActive()) return;
      this.time.delayedCall(CLASH_FACEOFF_PAUSE, () => {
        if (!this.sys.isActive()) return;
        onApproached();
      });
    };

    attackerView.moveTween = this.tweens.add({
      targets: attackerView,
      anchorX: atkX,
      anchorY: CLASH_Y,
      duration: CLASH_APPROACH_DURATION,
      ease: MOVE_EASE,
      onComplete: onBothApproached,
    });
    this.tweens.add({
      targets: attackerView.container,
      angle: dir * CLASH_APPROACH_TILT,
      duration: CLASH_APPROACH_DURATION,
      ease: MOVE_EASE,
    });

    defenderView.moveTween = this.tweens.add({
      targets: defenderView,
      anchorX: defX,
      anchorY: CLASH_Y,
      duration: CLASH_APPROACH_DURATION,
      ease: MOVE_EASE,
      onComplete: onBothApproached,
    });
    this.tweens.add({
      targets: defenderView.container,
      angle: -dir * CLASH_APPROACH_TILT,
      duration: CLASH_APPROACH_DURATION,
      ease: MOVE_EASE,
    });
  }

  // Phases 3–7: Wind-up → strike → recoil → return. Assumes both fighters are
  // already at the clash positions (after clashApproach or a looping windup).
  private clashStrike(
    attackerView: FighterView,
    defenderView: FighterView,
    attackerSide: FightSide,
    onContact: () => void,
    onImpact: () => void,
    onComplete: () => void,
  ): void {
    if (!this.sys.isActive()) return;

    const atkX = attackerSide === "player" ? CLASH_PLAYER_X : CLASH_ENEMY_X;
    const defX = attackerSide === "player" ? CLASH_ENEMY_X : CLASH_PLAYER_X;
    const dir = attackerSide === "player" ? 1 : -1;

    // --- Phase 3: Wind-up — attacker rocks back, defender shifts to guard. ---
    this.tweens.killTweensOf(attackerView.container);
    this.tweens.killTweensOf(defenderView.container);
    this.tweens.add({
      targets: attackerView.container,
      angle: -dir * CLASH_WINDUP_TILT,
      scaleX: 0.88,
      scaleY: 0.88,
      duration: CLASH_WINDUP_DURATION,
      ease: "Cubic.Out",
    });
    this.tweens.add({
      targets: defenderView.container,
      angle: dir * CLASH_GUARD_TILT,
      duration: CLASH_WINDUP_DURATION,
      ease: "Cubic.Out",
      onComplete: () => {
        if (!this.sys.isActive()) return;

        // --- Phase 4: Strike — attacker blasts past the centre line. ---
        // Fire the visual contact effect now: defender is still at defX
        // (not yet knocked back), which is the true point of contact.
        onContact();
        this.tweens.add({
          targets: attackerView,
          anchorX: defX - dir * CLASH_LUNGE_OVERSHOOT,
          duration: CLASH_STRIKE_DURATION,
          ease: "Cubic.In",
        });
        this.tweens.add({
          targets: attackerView.container,
          angle: dir * CLASH_STRIKE_TILT,
          scaleX: CLASH_IMPACT_SCALE,
          scaleY: CLASH_IMPACT_SCALE,
          duration: CLASH_STRIKE_DURATION,
          ease: "Cubic.In",
        });
        // Defender gets hit — knocked back with heavy recoil tilt.
        this.tweens.add({
          targets: defenderView,
          anchorX: defX + dir * CLASH_KNOCKBACK,
          duration: CLASH_STRIKE_DURATION,
          ease: "Cubic.Out",
        });
        this.tweens.add({
          targets: defenderView.container,
          angle: -dir * CLASH_RECOIL_TILT,
          duration: CLASH_STRIKE_DURATION,
          ease: "Cubic.Out",
          onComplete: () => {
            if (!this.sys.isActive()) return;

            onImpact();
            this.shakeRenderer();

            // --- Phase 5: Impact hold. ---
            this.time.delayedCall(CLASH_IMPACT_HOLD, () => {
              if (!this.sys.isActive()) return;

              // --- Phase 6: Recoil settle — attacker pulls back, defender stumbles. ---
              this.tweens.add({
                targets: attackerView,
                anchorX: atkX,
                duration: CLASH_RECOIL_DURATION,
                ease: "Cubic.Out",
              });
              this.tweens.add({
                targets: attackerView.container,
                angle: dir * CLASH_SETTLE_ATK_TILT,
                scaleX: 1,
                scaleY: 1,
                duration: CLASH_RECOIL_DURATION,
                ease: "Cubic.Out",
              });
              this.tweens.add({
                targets: defenderView,
                anchorX: defX,
                duration: CLASH_RECOIL_DURATION,
                ease: "Back.Out",
              });
              this.tweens.add({
                targets: defenderView.container,
                angle: -dir * CLASH_SETTLE_DEF_TILT,
                duration: CLASH_RECOIL_DURATION,
                ease: "Cubic.Out",
                onComplete: () => {
                  if (!this.sys.isActive()) return;

                  // --- Phase 7: Straighten — angles return to 0.
                  // onComplete fires here so formation repositioning and
                  // angle-straightening happen concurrently — fighters glide
                  // home while their posture resets simultaneously.
                  this.tweens.add({
                    targets: attackerView.container,
                    angle: 0,
                    duration: CLASH_RETURN_DURATION,
                    ease: "Cubic.Out",
                  });
                  this.tweens.add({
                    targets: defenderView.container,
                    angle: 0,
                    duration: CLASH_RETURN_DURATION,
                    ease: "Cubic.Out",
                  });
                  onComplete();
                },
              });
            });
          },
        });
      },
    });
  }

  private animateYourTurn(show: boolean): void {
    const visibleBgY = this.yourTurnVisibleY;
    const visibleTextY = visibleBgY + ROUND_BANNER_H / 2;
    const hiddenBgY = visibleBgY - ROUND_BANNER_H;
    const hiddenTextY = hiddenBgY + ROUND_BANNER_H / 2;

    if (this.yourTurnBg) {
      this.tweens.killTweensOf(this.yourTurnBg);
      this.tweens.add({
        targets: this.yourTurnBg,
        y: show ? visibleBgY : hiddenBgY,
        alpha: show ? 1 : 0,
        duration: show ? YOUR_TURN_SLIDE_MS : YOUR_TURN_FADE_MS,
        ease: show ? "Back.Out" : "Cubic.In",
      });
    }
    if (this.yourTurnText) {
      this.tweens.killTweensOf(this.yourTurnText);
      this.tweens.add({
        targets: this.yourTurnText,
        y: show ? visibleTextY : hiddenTextY,
        alpha: show ? 1 : 0,
        duration: show ? YOUR_TURN_SLIDE_MS : YOUR_TURN_FADE_MS,
        ease: show ? "Back.Out" : "Cubic.In",
      });
    }
  }

  private animateRoundNumber(oldRound: number, newRound: number): void {
    if (!this.roundNumText) return;
    const x = this.roundNumText.x;
    const midY = this.roundNumMidY;

    const outgoing = this.add
      .bitmapText(x, midY, GAME_BITMAP_FONT, String(oldRound), FONT_ROUND_NUM)
      .setOrigin(0.5);
    this.tweens.add({
      targets: outgoing,
      y: midY - ROUND_NUM_SLIDE_Y,
      alpha: 0,
      duration: ROUND_NUM_FADE_MS,
      ease: "Cubic.Out",
      onComplete: () => {
        outgoing.destroy();
      },
    });

    this.tweens.killTweensOf(this.roundNumText);
    this.roundNumText
      .setText(String(newRound))
      .setAlpha(0)
      .setY(midY + ROUND_NUM_SLIDE_Y);
    this.tweens.add({
      targets: this.roundNumText,
      y: midY,
      alpha: 1,
      duration: ROUND_NUM_FADE_MS,
      ease: "Cubic.Out",
    });
  }

  private shakeRenderer(): void {
    const el = this.game.canvas.parentElement;
    if (!el) return;
    const MAG = 5;
    const STEPS = 10;
    const STEP_MS = 18;
    let step = 0;
    const tick = () => {
      if (!this.sys.isActive() || step >= STEPS) {
        el.style.transform = "";
        return;
      }
      const fade = 1 - step / STEPS;
      const x = (Math.random() - 0.5) * MAG * 2 * fade;
      const y = (Math.random() - 0.5) * MAG * 2 * fade;
      el.style.transform = `translate(${x}px, ${y}px)`;
      step++;
      this.time.delayedCall(STEP_MS, tick);
    };
    tick();
  }

  private subscribeToGameEvents(): void {
    const gs = this.gameService!;

    const unsubAttacked = gs.onAttacked((payload) => {
      if (this.resolved || !this.sys.isActive()) return;
      const iAmAttacker = payload.attackingPlayerId === this.myPlayerId;

      if (iAmAttacker) {
        // Prefer server-confirmed characters; fall back to local selection.
        const leadIndex =
          payload.attackingCharacter !== undefined
            ? this.playerTeam.findIndex(
                (f) => f.id === payload.attackingCharacter,
              )
            : this.playerOrder[0];
        const targetIndex =
          payload.attackedCharacter !== undefined
            ? this.enemyTeam.findIndex(
                (f) => f.id === payload.attackedCharacter,
              )
            : (this.selectedTarget ?? this.enemyOrder[0]);
        const attacker =
          this.playerTeam[leadIndex >= 0 ? leadIndex : this.playerOrder[0]];
        const defender =
          this.enemyTeam[
            targetIndex >= 0
              ? targetIndex
              : (this.selectedTarget ?? this.enemyOrder[0])
          ];
        const attackerView =
          this.playerViews[leadIndex >= 0 ? leadIndex : this.playerOrder[0]];
        const defenderView =
          this.enemyViews[
            targetIndex >= 0
              ? targetIndex
              : (this.selectedTarget ?? this.enemyOrder[0])
          ];

        // Two-flag gate: wait for both the approach animation AND the server's
        // turnChanged (which means the defender submitted their QTE result).
        let approachReady = false;
        let serverSignaled = false;
        let windupLoop: Phaser.Tweens.Tween | undefined;

        const maybeStrike = () => {
          if (!approachReady || !serverSignaled) return;
          if (!this.sys.isActive()) return;
          windupLoop?.stop();
          windupLoop = undefined;
          this.clashStrike(
            attackerView,
            defenderView,
            "player",
            () =>
              spawnSuperpowerEffect(
                this,
                defenderView.anchorX,
                defenderView.anchorY,
                attacker.superpower,
              ),
            () => {
              if (this.pendingSuperpower) {
                this.flashSuperpower();
                playSuperpowerSound(this);
                this.pendingSuperpower = false;
              }
              this.showToast(`[X] ${attacker.name} -> ${defender.name}!`);
            },
            () => {
              this.awaitingServer = false;
              this.animating = false;
              this.rotateOrder("player");
              this.selectedTarget = null;
              if (!this.finishIfResolved()) {
                this.refresh();
              }
            },
          );
        };

        // Register before starting approach so onTurnChanged can signal even if
        // it fires before the approach animation completes.
        this.pendingStrikeCallback = () => {
          serverSignaled = true;
          maybeStrike();
        };

        this.clashApproach(attackerView, defenderView, "player", () => {
          approachReady = true;
          this.showToast("[…] Waiting for defence…");
          windupLoop = this.tweens.add({
            targets: attackerView.container,
            scaleX: 0.88,
            scaleY: 0.88,
            angle: { from: CLASH_APPROACH_TILT, to: CLASH_WINDUP_TILT },
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut",
          });
          maybeStrike();
        });
      } else {
        // Use server-confirmed characters so the animation matches what the
        // attacker actually chose, not a local leading-character guess.
        const enemyAttackerIdx =
          payload.attackingCharacter !== undefined
            ? this.enemyTeam.findIndex(
                (f) => f.id === payload.attackingCharacter,
              )
            : this.enemyOrder[0];
        const myDefenderIdx =
          payload.attackedCharacter !== undefined
            ? this.playerTeam.findIndex(
                (f) => f.id === payload.attackedCharacter,
              )
            : this.playerOrder[0];
        const enemyLeadIndex =
          enemyAttackerIdx >= 0 ? enemyAttackerIdx : this.enemyOrder[0];
        const myLeadIndex =
          myDefenderIdx >= 0 ? myDefenderIdx : this.playerOrder[0];
        const attacker = this.enemyTeam[enemyLeadIndex];
        const defender = this.playerTeam[myLeadIndex];
        const attackerView = this.enemyViews[enemyLeadIndex];
        const defenderView = this.playerViews[myLeadIndex];
        this.animating = true;

        this.showToast(`[!] ${attacker.name} is attacking — DEFEND!`);

        // Track which of approach/QTE finished first; strike when both are ready.
        let qteMultiplier: number | undefined;
        let approachReady = false;
        let windupLoop: Phaser.Tweens.Tween | undefined;
        let defendSent = false;

        // Send the defend payload to the server as soon as the QTE resolves
        // (either by pressing space or by the timer expiring). Do NOT gate this
        // on the approach animation — the server may timeout waiting for defend.
        const sendDefend = (multiplier: number) => {
          if (defendSent) return;
          defendSent = true;
          gs.defend({
            quickTimeEventMultiplier: Math.min(
              QTE_MULTIPLIER_MAX,
              Math.max(QTE_MULTIPLIER_MIN, multiplier),
            ),
          });
        };

        const maybeStrike = () => {
          if (qteMultiplier === undefined || !approachReady) return;
          if (!this.sys.isActive()) return;

          windupLoop?.stop();
          windupLoop = undefined;

          const multiplier = qteMultiplier;
          const defenseLabel =
            multiplier >= 1.8
              ? "PERFECT"
              : multiplier >= 1.4
                ? "GREAT"
                : multiplier >= 1.1
                  ? "GOOD"
                  : "TOO SLOW";
          this.showToast(`[>] Defense: ${defenseLabel}`);

          this.clashStrike(
            attackerView,
            defenderView,
            "enemy",
            () =>
              spawnSuperpowerEffect(
                this,
                defenderView.anchorX,
                defenderView.anchorY,
                attacker.superpower,
              ),
            () => {
              this.showToast(`[X] ${attacker.name} -> ${defender.name}!`);
            },
            () => {
              this.animating = false;
              this.rotateOrder("enemy");
              this.refresh();
            },
          );
        };

        // Start approach immediately so the attacker is already moving during QTE.
        this.clashApproach(attackerView, defenderView, "enemy", () => {
          approachReady = true;
          // Loop a wind-up pulse on the attacker while waiting for QTE.
          windupLoop = this.tweens.add({
            targets: attackerView.container,
            scaleX: 0.88,
            scaleY: 0.88,
            angle: { from: -CLASH_APPROACH_TILT, to: -CLASH_WINDUP_TILT },
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut",
          });
          maybeStrike();
        });

        const defenderQtes = QTE_DEFINITIONS.filter(
          (q): q is QteDefinition => q.role === "defender",
        );
        const qte =
          defenderQtes[Math.floor(Math.random() * defenderQtes.length)];
        qteBridge.request(qte, (quality) => {
          if (!this.sys.isActive()) return;
          const multiplier =
            QTE_MULTIPLIER_MIN +
            quality * (QTE_MULTIPLIER_MAX - QTE_MULTIPLIER_MIN);
          qteMultiplier = multiplier;
          sendDefend(multiplier);
          maybeStrike();
        });
      }
    });

    const unsubCharsUpdated = gs.onCharactersUpdated((rosters) => {
      if (this.resolved) return;
      for (const roster of rosters) {
        const isMyRoster = roster.playerId === this.myPlayerId;
        const team = isMyRoster ? this.playerTeam : this.enemyTeam;
        for (const char of roster.characters) {
          const fighter = team.find((f) => f.id === char.type);
          if (fighter) {
            const delta = fighter.health - char.stats.health;
            if (delta > 0) {
              this.showToast(`[♥] ${fighter.name} -${Math.round(delta)} HP`);
            }
            fighter.health = char.stats.health;
          }
        }
      }
      this.refresh();
    });

    const unsubGameFinished = gs.onGameFinished((result) => {
      if (this.resolved) return;
      this.finishWith(
        result.winnerId === this.myPlayerId ? "You" : this.opponentLabel,
      );
    });

    const unsubTurnChanged = gs.onTurnChanged((session) => {
      if (this.resolved) return;

      const iAmAttacker =
        session.currentlyAttackingPlayerId === this.myPlayerId;
      this.turn = iAmAttacker ? "player" : "enemy";
      this.round += 1;

      // If an attack-side clash is waiting for the defender's QTE result, fire
      // the strike now. The animation completion callback handles refresh().
      if (this.pendingStrikeCallback) {
        const strike = this.pendingStrikeCallback;
        this.pendingStrikeCallback = undefined;
        strike();
        return;
      }

      if (iAmAttacker && this.selectedTarget === null) {
        this.selectedTarget = this.enemyOrder[0] ?? null;
      }
      this.refresh();
      if (iAmAttacker) {
        this.showToast(">> Your turn!");
      }
    });

    const unsubException = gs.onException((error) => {
      this.showToast(error.message);
      this.awaitingServer = false;
      this.animating = false;
      this.refresh();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      unsubAttacked();
      unsubCharsUpdated();
      unsubGameFinished();
      unsubTurnChanged();
      unsubException();
    });
  }

  private buildVignette(): void {
    const gfx = this.add.graphics();
    gfx.fillStyle(GAME_PALETTE.RED, 1);
    gfx.fillRect(0, 0, GAME_WIDTH, VIGNETTE_BORDER);
    gfx.fillRect(0, GAME_HEIGHT - VIGNETTE_BORDER, GAME_WIDTH, VIGNETTE_BORDER);
    gfx.fillRect(
      0,
      VIGNETTE_BORDER,
      VIGNETTE_BORDER,
      GAME_HEIGHT - VIGNETTE_BORDER * 2,
    );
    gfx.fillRect(
      GAME_WIDTH - VIGNETTE_BORDER,
      VIGNETTE_BORDER,
      VIGNETTE_BORDER,
      GAME_HEIGHT - VIGNETTE_BORDER * 2,
    );
    gfx.setAlpha(0).setDepth(15);
    this.vignetteAmbient = gfx;

    this.vignetteFlash = this.add
      .rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        GAME_PALETTE.RED,
      )
      .setAlpha(0)
      .setDepth(15);

    this.superpowerFlash = this.add
      .rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        0xff_ee_44,
      )
      .setAlpha(0)
      .setDepth(15);
  }

  private applyVignetteAmbient(time: number): void {
    if (!this.vignetteAmbient || this.vignetteBaseAlpha <= 0) return;
    const pulse = Math.sin(time * VIGNETTE_PULSE_SPEED) * VIGNETTE_PULSE_AMP;
    this.vignetteAmbient.setAlpha(Math.max(0, this.vignetteBaseAlpha + pulse));
  }

  private syncVignette(ratio: number, tookDamage: boolean): void {
    if (!this.vignetteAmbient || !this.vignetteFlash) return;
    this.vignetteBaseAlpha =
      ratio <= VIGNETTE_LOW_HP
        ? VIGNETTE_AMBIENT_MAX * (1 - ratio / VIGNETTE_LOW_HP)
        : 0;
    if (this.vignetteBaseAlpha <= 0) {
      this.vignetteAmbient.setAlpha(0);
    }
    const isLow = ratio <= VIGNETTE_LOW_HP;
    if (isLow && !this.lowHealthLoop) {
      playLowHealthSound(this);
      this.lowHealthLoop = this.time.addEvent({
        delay: 1200,
        loop: true,
        callback: () => playLowHealthSound(this),
      });
    } else if (!isLow && this.lowHealthLoop) {
      this.lowHealthLoop.destroy();
      this.lowHealthLoop = undefined;
    }
    if (!tookDamage) return;
    this.tweens.killTweensOf(this.vignetteFlash);
    this.vignetteFlash.setAlpha(VIGNETTE_FLASH_ALPHA);
    this.tweens.add({
      targets: this.vignetteFlash,
      alpha: 0,
      duration: VIGNETTE_FLASH_DURATION,
      ease: "Cubic.Out",
    });
  }

  private flashSuperpower(): void {
    if (!this.superpowerFlash) return;
    this.tweens.killTweensOf(this.superpowerFlash);
    this.superpowerFlash.setAlpha(0.52);
    this.tweens.add({
      targets: this.superpowerFlash,
      alpha: 0,
      duration: VIGNETTE_FLASH_DURATION,
      ease: "Cubic.Out",
    });
  }

  private syncBanner(banner: TeamBanner | undefined, team: Fighter[]): void {
    if (!banner) {
      return;
    }
    const total = team.reduce((sum, fighter) => sum + fighter.maxHealth, 0);
    const current = team.reduce((sum, fighter) => sum + fighter.health, 0);
    const ratio = total === 0 ? 0 : current / total;
    const newWidth = ratio * TEAM_BAR_WIDTH;

    if (newWidth < banner.prevWidth) {
      banner.drain.setSize(banner.prevWidth, TEAM_BAR_HEIGHT);
      this.tweens.killTweensOf(banner.drain);
      this.time.delayedCall(HP_DRAIN_DELAY, () => {
        if (!this.sys.isActive()) return;
        this.tweens.add({
          targets: banner.drain,
          width: newWidth,
          duration: HP_DRAIN_DURATION,
          ease: "Cubic.Out",
        });
      });
    }

    banner.prevWidth = newWidth;
    banner.fill.setSize(newWidth, TEAM_BAR_HEIGHT);
  }

  private showToast(message: string): void {
    this.toastQueue.push(message);
    if (!this.toastBusy) {
      this.flushToastQueue();
    }
  }

  private flushToastQueue(): void {
    const message = this.toastQueue.shift();
    if (message === undefined) {
      this.toastBusy = false;
      return;
    }

    this.toastBusy = true;
    const holdMs = Math.max(
      TOAST_HOLD_MIN_MS,
      TOAST_HOLD_MS / (this.toastQueue.length + 1),
    );

    const text = this.add
      .bitmapText(TOAST_PADDING_X, 0, GAME_BITMAP_FONT, message, FONT_BODY)
      .setOrigin(0, 0.5)
      .setMaxWidth(TOAST_MAX_W - TOAST_PADDING_X * 2);

    const bgW =
      Math.min(text.width, TOAST_MAX_W - TOAST_PADDING_X * 2) +
      TOAST_PADDING_X * 2;
    const bgH = text.height + TOAST_PADDING_Y * 2;

    const bg = this.add
      .rectangle(0, 0, bgW, bgH, GAME_PALETTE.MAUVE)
      .setOrigin(0, 0.5);

    const container = this.add
      .container(TOAST_X, TOAST_ENTER_Y, [bg, text])
      .setAlpha(0)
      .setDepth(TOAST_DEPTH);

    this.tweens.add({
      targets: container,
      alpha: 1,
      y: TOAST_Y,
      duration: TOAST_FADE_IN_MS,
      ease: "Cubic.Out",
      onComplete: () => {
        if (!this.sys.isActive()) return;
        this.time.delayedCall(holdMs, () => {
          if (!this.sys.isActive()) return;
          this.tweens.add({
            targets: container,
            alpha: 0,
            y: TOAST_EXIT_Y,
            duration: TOAST_FADE_OUT_MS,
            ease: "Cubic.In",
            onComplete: () => {
              container.destroy();
              this.flushToastQueue();
            },
          });
        });
      },
    });
  }
}
