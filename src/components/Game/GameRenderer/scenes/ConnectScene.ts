import { COLORS } from '@/constants/common';
import { createSession, getSession, joinSession } from '@/services/api';
import Phaser from 'phaser';
import {
  GAME_FONT,
  GAME_HEIGHT,
  GAME_PALETTE,
  GAME_WIDTH,
} from '../GameRenderer.constants';
import type {
  ConnectSceneData,
  GameMode,
  SessionInfo,
} from '../GameRenderer.types';
import { createBitmapText } from '../utils/text/createBitmapText';
import { type Debounced, debounce } from '../utils/timing/debounce';
import { createButton } from '../utils/widgets/createButton';
import { createPanel } from '../utils/widgets/createPanel';
import {
  CHARACTER_SELECT_SCENE_KEY,
  CONNECT_SCENE_KEY,
  START_SCENE_KEY,
} from './sceneKeys';

const FONT_HEADER = 16;
const FONT_BODY = 8;

// Two columns split by a centre divider: JOIN (left) / SHARE (right).
const DIVIDER_X = GAME_WIDTH / 2;
const LEFT_CX = GAME_WIDTH / 4;
const RIGHT_CX = (GAME_WIDTH / 4) * 3;
const HEADER_Y = 44;
const INPUT_Y = 104;
const JOIN_STATUS_Y = INPUT_Y + 26;
const BOTTOM_Y = GAME_HEIGHT - 38;

// Clickable "copy the session id" box on the SHARE side.
const SHARE_BOX_Y = 100;
const SHARE_BOX_WIDTH = 180;
const SHARE_BOX_HEIGHT = 36;
const SHARE_HINT_Y = SHARE_BOX_Y + 34;
const SHARE_STATUS_Y = SHARE_HINT_Y + 16;
// The session id can be long (e.g. a UUID); the box shows a clipped preview
// while the click always copies the full value.
const ID_PREVIEW_MAX = 14;

// How often we re-check our own session for an arriving opponent, and how long
// we wait after the last keystroke before checking a typed id against the API.
const POLL_INTERVAL_MS = 1500;
const JOIN_DEBOUNCE_MS = 500;

// JOIN side reports on the typed-id check; SHARE side reports on the hosted
// session we expose for the opponent to join.
const JOIN_WAITING = 'Waiting for input';
const JOIN_JOINING = 'Joining...';
const SHARE_WAITING = 'Waiting for the other player';

export class ConnectScene extends Phaser.Scene {
  private mode: GameMode = 'multiplayer';
  private sessionId?: string;
  private playerId?: string;
  // Latches once we hand off to the next scene so a slow poll/join that
  // resolves afterwards can't trigger a second transition.
  private resolved = false;
  private joinStatus?: Phaser.GameObjects.BitmapText;
  private shareStatus?: Phaser.GameObjects.BitmapText;
  private shareId?: Phaser.GameObjects.BitmapText;
  private shareHint?: Phaser.GameObjects.BitmapText;
  private joinInput?: HTMLInputElement;
  private joinDebounced?: Debounced<[string]>;

  constructor() {
    super(CONNECT_SCENE_KEY);
  }

  create(data: ConnectSceneData): void {
    this.mode = data.mode;
    this.resolved = false;
    this.sessionId = undefined;
    this.playerId = undefined;

    this.buildLayout();
    this.joinDebounced = debounce(
      (id: string) => this.attemptJoin(id),
      JOIN_DEBOUNCE_MS,
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());

    // Create our own session up front so the SHARE panel is live immediately,
    // then poll it for an opponent. A `?join_id=` deep link additionally fires
    // an auto-join attempt below — whichever path resolves first wins.
    this.hostSession();

    if (data.autoJoinId) {
      if (this.joinInput) {
        this.joinInput.value = data.autoJoinId;
      }
      this.attemptJoin(data.autoJoinId);
    }
  }

  private buildLayout(): void {
    this.add.rectangle(
      DIVIDER_X,
      GAME_HEIGHT / 2,
      2,
      GAME_HEIGHT - 40,
      GAME_PALETTE.LAVENDER,
    );

    // --- JOIN (left) ---
    createBitmapText(this, LEFT_CX, HEADER_Y, 'JOIN', FONT_HEADER);
    this.joinInput = this.buildInput();
    this.joinStatus = createBitmapText(
      this,
      LEFT_CX,
      JOIN_STATUS_Y,
      JOIN_WAITING,
      FONT_BODY,
      GAME_PALETTE.LAVENDER,
    );
    createButton(this, LEFT_CX, BOTTOM_Y, 'Leave', {
      width: 100,
      fill: GAME_PALETTE.ORCHID,
      onClick: () => this.scene.start(START_SCENE_KEY),
    });

    // --- SHARE (right) ---
    createBitmapText(this, RIGHT_CX, HEADER_Y, 'SHARE', FONT_HEADER);
    this.buildShareBox();
    this.shareStatus = createBitmapText(
      this,
      RIGHT_CX,
      SHARE_STATUS_Y,
      SHARE_WAITING,
      FONT_BODY,
      GAME_PALETTE.LAVENDER,
    );
  }

  private buildInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Session ID';
    input.maxLength = 64;
    // Mirror the in-canvas NES widgets: blush fill, the baked pixel font, and a
    // hard bottom/right bevel (the panels' `inset -2px -2px` look) — no rounded
    // corners or anti-aliased borders, so the DOM field reads as one of them.
    input.style.cssText = [
      'width:150px',
      'height:22px',
      'box-sizing:border-box',
      'padding:0 6px',
      'border:none',
      `background:${COLORS.BLUSH}`,
      'color:#1a1a2e',
      `font-family:'${GAME_FONT}',monospace`,
      'font-size:8px',
      'text-align:center',
      'outline:none',
      `box-shadow:inset -2px -2px 0 0 ${COLORS.ROSE}`,
    ].join(';');

    input.addEventListener('input', () => {
      const value = input.value.trim();
      if (!value) {
        this.joinDebounced?.cancel();
        this.setJoinStatus(JOIN_WAITING);
        return;
      }
      this.joinDebounced?.(value);
    });

    this.add.dom(LEFT_CX, INPUT_Y, input);

    return input;
  }

  private buildShareBox(): void {
    const box = createPanel(
      this,
      RIGHT_CX,
      SHARE_BOX_Y,
      SHARE_BOX_WIDTH,
      SHARE_BOX_HEIGHT,
      GAME_PALETTE.BLUSH,
    ).setInteractive({ useHandCursor: true });

    this.shareId = createBitmapText(
      this,
      RIGHT_CX,
      SHARE_BOX_Y,
      '...',
      FONT_BODY,
    );
    this.shareHint = createBitmapText(
      this,
      RIGHT_CX,
      SHARE_HINT_Y,
      'Click to copy ID',
      FONT_BODY,
      GAME_PALETTE.LAVENDER,
    );

    box.on('pointerup', () => this.copyId());
  }

  private copyId(): void {
    if (!this.sessionId) {
      return;
    }

    void globalThis.navigator?.clipboard?.writeText(this.sessionId);
    this.shareHint?.setText('Copied!');
  }

  private async hostSession(): Promise<void> {
    try {
      const { sessionId, playerId } = await createSession();
      const shortSessionId = sessionId.slice(-8);

      if (!this.sys.isActive() || this.resolved) {
        return;
      }

      this.sessionId = shortSessionId;
      this.playerId = playerId;
      this.shareId?.setText(this.previewId(shortSessionId));
      this.startPolling();
    } catch (error) {
      this.setShareStatus(this.toMessage(error));
    }
  }

  private previewId(sessionId: string): string {
    return sessionId.length > ID_PREVIEW_MAX
      ? `${sessionId.slice(0, ID_PREVIEW_MAX)}...`
      : sessionId;
  }

  private startPolling(): void {
    this.time.addEvent({
      delay: POLL_INTERVAL_MS,
      loop: true,
      callback: () => this.pollSession(),
    });
  }

  private async pollSession(): Promise<void> {
    if (this.resolved || !this.sessionId) {
      return;
    }

    try {
      const session = await getSession(this.sessionId);
      if (session.secondPlayerId && this.playerId) {
        this.proceed({
          sessionId: this.sessionId,
          playerId: this.playerId,
          role: 'host',
        });
      }
    } catch (error) {
      this.setShareStatus(this.toMessage(error));
    }
  }

  private async attemptJoin(sessionId: string): Promise<void> {
    if (this.resolved) {
      return;
    }
    // Joining the session we are hosting is a no-op the backend would reject.
    if (sessionId === this.sessionId) {
      return;
    }

    this.setJoinStatus(JOIN_JOINING);

    try {
      const credentials = await joinSession(sessionId);
      this.proceed({ ...credentials, role: 'guest' });
    } catch (error) {
      this.setJoinStatus(this.toMessage(error));
    }
  }

  private proceed(session: SessionInfo): void {
    if (this.resolved) {
      return;
    }
    this.resolved = true;
    this.scene.start(CHARACTER_SELECT_SCENE_KEY, {
      mode: this.mode,
      session,
    });
  }

  private setJoinStatus(message: string): void {
    this.joinStatus?.setText(message);
  }

  private setShareStatus(message: string): void {
    this.shareStatus?.setText(message);
  }

  private toMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Connection failed';
  }

  private cleanup(): void {
    this.joinDebounced?.cancel();
    this.joinInput = undefined;
  }
}
