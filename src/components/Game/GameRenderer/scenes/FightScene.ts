import Phaser from "phaser";
import {
  CHARACTERS,
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
import {
  isAlive,
  isTeamDefeated,
  nextAliveIndex,
} from "../utils/combat/nextAliveIndex";
import { wedgePositions } from "../utils/layout/wedgePositions";
import { createBitmapText } from "../utils/text/createBitmapText";
import { createButton } from "../utils/widgets/createButton";
import { FIGHT_SCENE_KEY, WINNER_SCENE_KEY } from "./sceneKeys";

const FONT_TITLE = 16;
const FONT_BODY = 8;

// --- Formation (chevron wedge, per design) ----------------------------------
// Slot positions come from wedgePositions(); the enemy side mirrors the
// player's x across the centre line.
const VS_Y = 135;
const AVATAR_SIZE = 28;
const LEADER_AVATAR_SIZE = 38; // the leading fighter is drawn larger

// --- Per-fighter HP bar (under the avatar) ----------------------------------
const HP_BAR_WIDTH = 32;
const HP_BAR_HEIGHT = 4;
const HP_BAR_OFFSET_Y = 24;
const NAME_OFFSET_Y = 31;
const FRAME_PADDING = 6;

// --- Team HP banners (top corners) ------------------------------------------
const TEAM_BAR_Y = 22;
const TEAM_BAR_WIDTH = 150;
const TEAM_BAR_HEIGHT = 8;
const PLAYER_BAR_X = 88;
const ENEMY_BAR_X = GAME_WIDTH - 88;

const DEAD_TINT = 0x33_33_33;
const LIVE_TINT = 0xff_ff_ff;
const DEAD_ALPHA = 0.3;
// Beat between the player acting and the computer's reply, so each hit reads.
const ENEMY_TURN_DELAY_MS = 900;

interface FighterView {
  avatar: Phaser.GameObjects.Image;
  frame: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
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

  private playerLead = 0;
  private enemyLead = 0;
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

    createBitmapText(this, GAME_WIDTH / 2, VS_Y, "VS", FONT_TITLE);
    this.roundText = createBitmapText(this, GAME_WIDTH / 2, 12, "", FONT_BODY);

    this.buildBanners();
    this.buildFormation("player", this.playerTeam, this.playerViews);
    this.buildFormation("enemy", this.enemyTeam, this.enemyViews);
    this.buildControls();

    this.refresh();
    this.updateLog("Pick an enemy, then Attack.");
  }

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
    this.playerLead = 0;
    this.enemyLead = 0;
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
    // Track behind the fill so depleted team health stays visible.
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
        GAME_PALETTE.ROSE,
      )
      .setOrigin(0, 0.5);

    return { fill };
  }

  private buildFormation(
    side: FightSide,
    team: Fighter[],
    views: FighterView[],
  ): void {
    const slots = wedgePositions(team.length);

    team.forEach((fighter, index) => {
      const slot = slots[index];
      // The player's chevron sits on the left as designed; the enemy mirrors
      // each x across the centre line so its apex points back at the player.
      const x = side === "player" ? slot.x : GAME_WIDTH - slot.x;
      const y = slot.y;

      const frame = this.add
        .rectangle(
          x,
          y,
          AVATAR_SIZE + FRAME_PADDING,
          AVATAR_SIZE + FRAME_PADDING,
          GAME_PALETTE.BLUSH,
        )
        .setVisible(false);
      const avatar = this.add
        .image(x, y, avatarTextureKey(fighter.id))
        .setDisplaySize(AVATAR_SIZE, AVATAR_SIZE);

      this.add.rectangle(
        x,
        y + HP_BAR_OFFSET_Y,
        HP_BAR_WIDTH,
        HP_BAR_HEIGHT,
        GAME_PALETTE.PERIWINKLE,
      );
      const hpFill = this.add
        .rectangle(
          x - HP_BAR_WIDTH / 2,
          y + HP_BAR_OFFSET_Y,
          HP_BAR_WIDTH,
          HP_BAR_HEIGHT,
          GAME_PALETTE.ROSE,
        )
        .setOrigin(0, 0.5);
      createBitmapText(this, x, y + NAME_OFFSET_Y, fighter.name, FONT_BODY);

      // Enemy fighters are the player's targets: clicking one selects it.
      if (side === "enemy") {
        avatar.setInteractive({ useHandCursor: true });
        avatar.on("pointerdown", () => this.selectTarget(index));
      }

      views.push({ avatar, frame, hpFill });
    });
  }

  private buildControls(): void {
    this.log = createBitmapText(this, GAME_WIDTH / 2, 210, "", FONT_BODY);

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
        fill: GAME_PALETTE.ROSE,
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

    const attacker = this.playerTeam[this.playerLead];
    const defender = this.enemyTeam[this.selectedTarget];
    this.applyHit(attacker, defender);
    this.updateLog(
      `${attacker.name} hits ${defender.name}${isAlive(defender) ? "!" : " - down!"}`,
    );

    if (this.finishIfResolved()) {
      return;
    }

    // The leading attacker rotates to the next fighter for the team's next turn.
    this.playerLead = nextAliveIndex(this.playerTeam, this.playerLead + 1);
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

    const target = chooseEnemyTarget(this.playerTeam);
    const attacker = this.enemyTeam[this.enemyLead];
    const defender = this.playerTeam[target];
    this.applyHit(attacker, defender);
    this.updateLog(
      `${attacker.name} hits ${defender.name}${isAlive(defender) ? "!" : " - down!"}`,
    );

    if (this.finishIfResolved()) {
      return;
    }

    this.enemyLead = nextAliveIndex(this.enemyTeam, this.enemyLead + 1);
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

  private finishIfResolved(): boolean {
    const enemyDown = isTeamDefeated(this.enemyTeam);
    const playerDown = isTeamDefeated(this.playerTeam);
    if (!enemyDown && !playerDown) {
      return false;
    }

    this.resolved = true;
    const winner = enemyDown ? "You" : this.opponentLabel;
    this.refresh();
    this.time.delayedCall(ENEMY_TURN_DELAY_MS, () => {
      if (this.sys.isActive()) {
        this.scene.start(WINNER_SCENE_KEY, { winner });
      }
    });
    return true;
  }

  private refresh(): void {
    this.syncTeam(this.playerTeam, this.playerViews, this.playerLead, false);
    this.syncTeam(this.enemyTeam, this.enemyViews, this.enemyLead, true);
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

  private syncTeam(
    team: Fighter[],
    views: FighterView[],
    lead: number,
    isEnemy: boolean,
  ): void {
    team.forEach((fighter, index) => {
      const view = views[index];
      const alive = isAlive(fighter);
      const isLeader = alive && index === lead;
      const size = isLeader ? LEADER_AVATAR_SIZE : AVATAR_SIZE;

      view.avatar.setDisplaySize(size, size);
      view.avatar.setAlpha(alive ? 1 : DEAD_ALPHA);
      view.avatar.setTint(alive ? LIVE_TINT : DEAD_TINT);

      view.hpFill
        .setVisible(alive)
        .setSize(
          (fighter.health / fighter.maxHealth) * HP_BAR_WIDTH,
          HP_BAR_HEIGHT,
        );

      // Frame the active leading attacker; on the enemy side, the chosen target
      // gets a (differently coloured) frame so the player sees their pick.
      const isTarget =
        isEnemy && alive && this.selectedTarget === index && !this.resolved;
      view.frame
        .setVisible(isLeader || isTarget)
        .setFillStyle(isTarget ? GAME_PALETTE.LAVENDER : GAME_PALETTE.BLUSH)
        .setSize(size + FRAME_PADDING, size + FRAME_PADDING);
    });
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
