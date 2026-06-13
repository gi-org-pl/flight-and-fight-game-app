import Phaser from "phaser";
import {
  CHARACTERS,
  GAME_BITMAP_FONT,
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
  MAX_ROSTER,
} from "../GameRenderer.constants";
import type {
  Fighter,
  FightSceneData,
  FightSide,
  GameCharacter,
} from "../GameRenderer.types";
import { avatarTextureKey } from "../utils/avatar/generateAvatar";
import { chooseEnemyTarget } from "../utils/combat/chooseEnemyTarget";
import { computeDamage } from "../utils/combat/computeDamage";
import { createEnemyRoster } from "../utils/combat/createEnemyRoster";
import { createFighter } from "../utils/combat/createFighter";
import { isAlive, isTeamDefeated } from "../utils/combat/nextAliveIndex";
import { wedgePositions } from "../utils/layout/wedgePositions";
import { createBitmapText } from "../utils/text/createBitmapText";
import { createButton } from "../utils/widgets/createButton";
import { FIGHT_SCENE_KEY, WINNER_SCENE_KEY } from "./sceneKeys";

const FONT_TITLE = 16;
const FONT_BODY = 8;

// --- Formation (chevron wedge, per design) ----------------------------------
const VS_Y = 135;
const AVATAR_SIZE = 28;
const LEADER_AVATAR_SIZE = 38;

// --- Per-fighter elements, in container-local coords (0,0 = fighter centre) -
const HP_BAR_WIDTH = 32;
const HP_BAR_HEIGHT = 4;
const HP_BAR_OFFSET_Y = 22;
const NAME_OFFSET_Y = 30;
const FRAME_PADDING = 6;

// --- Team HP banners (top corners) ------------------------------------------
const TEAM_BAR_Y = 22;
const TEAM_BAR_WIDTH = 150;
const TEAM_BAR_HEIGHT = 8;
const PLAYER_BAR_X = 88;
const ENEMY_BAR_X = GAME_WIDTH - 88;

// --- Visual / timing --------------------------------------------------------
const LIVE_TINT = 0xff_ff_ff;
const ENEMY_TURN_DELAY_MS = 900;

// --- Animation --------------------------------------------------------------
const MOVE_DURATION = 350;
const MOVE_EASE = "Cubic.Out";
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
  avatar: Phaser.GameObjects.Image;
  frame: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
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

  private opponentLabel = "Computer";
  private log?: Phaser.GameObjects.BitmapText;
  private roundText?: Phaser.GameObjects.BitmapText;
  private attackButton?: Phaser.GameObjects.Container;

  constructor() {
    super(FIGHT_SCENE_KEY);
  }

  create(data: FightSceneData): void {
    this.resetState(data);

    const overlay = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, GAME_PALETTE.PERIWINKLE)
      .setAlpha(1);

    this.tweens.add({
      targets: overlay,
      alpha: 0.9,
      duration: 600,
      ease: "Cubic.Out",
    });

    createBitmapText(this, GAME_WIDTH / 2, VS_Y, "VS", FONT_TITLE);
    this.roundText = createBitmapText(this, GAME_WIDTH / 2, 12, "", FONT_BODY);

    this.buildBanners();
    this.buildFormation("player", this.playerTeam, this.playerViews);
    this.buildFormation("enemy", this.enemyTeam, this.enemyViews);
    this.buildControls();

    this.refresh();
    this.updateLog("Pick an enemy, then Attack.");
  }

  update(time: number): void {
    this.applyWander(this.playerViews, this.playerTeam, time);
    this.applyWander(this.enemyViews, this.enemyTeam, time);
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
      CHARACTERS.map((character) => [character.id, character]),
    );
    const playerCharacters = data.roster
      .map((id) => byId.get(id))
      .filter((character): character is GameCharacter => Boolean(character));

    this.playerTeam = playerCharacters.map(createFighter);
    this.enemyTeam = createEnemyRoster(CHARACTERS, data.roster, MAX_ROSTER).map(
      createFighter,
    );

    this.playerViews = [];
    this.enemyViews = [];
    // Initial formation order: 0, 1, 2, … roster length.
    this.playerOrder = this.playerTeam.map((_, i) => i);
    this.enemyOrder = this.enemyTeam.map((_, i) => i);
    this.selectedTarget = null;
    this.turn = "player";
    this.round = 1;
    this.resolved = false;
  }

  // --- Build -----------------------------------------------------------------

  private buildBanners(): void {
    this.playerBanner = this.buildBanner(PLAYER_BAR_X, "You");
    this.enemyBanner = this.buildBanner(ENEMY_BAR_X, this.opponentLabel);
  }

  private buildBanner(x: number, name: string): TeamBanner {
    createBitmapText(this, x, 8, name, FONT_BODY);
    this.add.rectangle(
      x,
      TEAM_BAR_Y,
      TEAM_BAR_WIDTH,
      TEAM_BAR_HEIGHT,
      GAME_PALETTE.PERIWINKLE,
    );
    const fill = this.add
      .rectangle(
        x - TEAM_BAR_WIDTH / 2,
        TEAM_BAR_Y,
        TEAM_BAR_WIDTH,
        TEAM_BAR_HEIGHT,
        GAME_PALETTE.GREEN,
      )
      .setOrigin(0, 0.5);

    return { fill };
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

      const frame = this.add
        .rectangle(
          0,
          0,
          AVATAR_SIZE + FRAME_PADDING,
          AVATAR_SIZE + FRAME_PADDING,
          GAME_PALETTE.BLUSH,
        )
        .setVisible(false);

      const avatar = this.add
        .image(0, 0, avatarTextureKey(fighter.id))
        .setDisplaySize(AVATAR_SIZE, AVATAR_SIZE);

      const hpTrack = this.add.rectangle(
        0,
        HP_BAR_OFFSET_Y,
        HP_BAR_WIDTH,
        HP_BAR_HEIGHT,
        GAME_PALETTE.PERIWINKLE,
      );
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
        anchorX: pos.x,
        anchorY: pos.y,
        targetX: pos.x,
        targetY: pos.y,
        phase: index * PHASE_STEP,
        fallen: false,
      });
    }
  }

  private buildControls(): void {
    this.log = createBitmapText(this, GAME_WIDTH / 2, 218, "", FONT_BODY);

    createButton(this, 70, GAME_HEIGHT - 20, "Retreat", {
      width: 96,
      fill: GAME_PALETTE.ORCHID,
      onClick: () =>
        this.scene.start(WINNER_SCENE_KEY, { winner: this.opponentLabel }),
    });
    this.attackButton = createButton(
      this,
      GAME_WIDTH - 88,
      GAME_HEIGHT - 20,
      "Attack",
      {
        width: 140,
        fill: GAME_PALETTE.RED,
        onClick: () => this.attack(),
      },
    );
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
    this.updateLog(`Target: ${this.enemyTeam[index].name}. Press Attack.`);
  }

  private attack(): void {
    if (this.turn !== "player" || this.resolved) {
      return;
    }
    if (this.selectedTarget === null) {
      this.updateLog("Select an enemy fighter first.");
      return;
    }

    const leadIndex = this.playerOrder[0];
    const attacker = this.playerTeam[leadIndex];
    const defender = this.enemyTeam[this.selectedTarget];

    this.applyHit(attacker, defender);
    this.updateLog(
      `${attacker.name} hits ${defender.name}${isAlive(defender) ? "!" : " - down!"}`,
    );

    if (this.finishIfResolved()) {
      return;
    }

    // Rotate the leader to the back of the queue: [0,1,2,3,4] → [1,2,3,4,0].
    this.rotateOrder("player");
    this.selectedTarget = null;
    this.turn = "enemy";
    this.refresh();

    this.time.delayedCall(ENEMY_TURN_DELAY_MS, () => this.enemyTurn());
  }

  // --- Enemy turn ------------------------------------------------------------

  private enemyTurn(): void {
    if (this.resolved || !this.sys.isActive()) {
      return;
    }

    const leadIndex = this.enemyOrder[0];
    const attacker = this.enemyTeam[leadIndex];
    const target = chooseEnemyTarget(this.playerTeam);
    const defender = this.playerTeam[target];

    this.applyHit(attacker, defender);
    this.updateLog(
      `${attacker.name} hits ${defender.name}${isAlive(defender) ? "!" : " - down!"}`,
    );

    if (this.finishIfResolved()) {
      return;
    }

    this.rotateOrder("enemy");
    this.turn = "player";
    this.round += 1;
    this.refresh();
  }

  // --- Shared ----------------------------------------------------------------

  private applyHit(attacker: Fighter, defender: Fighter): void {
    const damage = computeDamage(attacker, defender);
    defender.health = Math.max(0, defender.health - damage);
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
    const enemyDown = isTeamDefeated(this.enemyTeam);
    const playerDown = isTeamDefeated(this.playerTeam);
    if (!enemyDown && !playerDown) {
      return false;
    }

    this.resolved = true;
    const winner = enemyDown ? "You" : this.opponentLabel;
    this.refresh();
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

    const turnLabel =
      this.turn === "player" ? "Your turn" : `${this.opponentLabel}'s turn`;
    this.roundText?.setText(
      this.resolved ? "Battle over" : `Round ${this.round} - ${turnLabel}`,
    );

    const canAttack =
      !this.resolved && this.turn === "player" && this.selectedTarget !== null;
    this.attackButton?.setAlpha(canAttack ? 1 : 0.4);
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

      const isLeader = index === leadIndex;
      const isTarget =
        isEnemy && this.selectedTarget === index && !this.resolved;
      const size = isLeader ? LEADER_AVATAR_SIZE : AVATAR_SIZE;

      view.avatar.setDisplaySize(size, size);
      view.avatar.setTint(LIVE_TINT);
      view.hpFill
        .setVisible(true)
        .setSize(
          (fighter.health / fighter.maxHealth) * HP_BAR_WIDTH,
          HP_BAR_HEIGHT,
        );
      view.frame
        .setVisible(isLeader || isTarget)
        .setFillStyle(isTarget ? GAME_PALETTE.LAVENDER : GAME_PALETTE.BLUSH)
        .setSize(size + FRAME_PADDING, size + FRAME_PADDING);

      // Animate to the new slot when the intended destination changed.
      const target = assignment.get(index);
      if (target && (target.x !== view.targetX || target.y !== view.targetY)) {
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

  private syncBanner(banner: TeamBanner | undefined, team: Fighter[]): void {
    if (!banner) {
      return;
    }
    const total = team.reduce((sum, fighter) => sum + fighter.maxHealth, 0);
    const current = team.reduce((sum, fighter) => sum + fighter.health, 0);
    const ratio = total === 0 ? 0 : current / total;
    banner.fill.setSize(ratio * TEAM_BAR_WIDTH, TEAM_BAR_HEIGHT);
  }

  private updateLog(message: string): void {
    this.log?.setText(message);
  }
}
