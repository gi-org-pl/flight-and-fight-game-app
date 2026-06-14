import Phaser from "phaser";
import {
  GAME_HEIGHT,
  GAME_WIDTH,
} from "../../GameRenderer.constants";
import { BootScene } from "../../scenes/BootScene";
import { CharacterSelectScene } from "../../scenes/CharacterSelectScene";
import { ConnectScene } from "../../scenes/ConnectScene";
import { FightScene } from "../../scenes/FightScene";
import { StartScene } from "../../scenes/StartScene";
import { WinnerScene } from "../../scenes/WinnerScene";

export const createGameConfig = (
  parent: HTMLElement,
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.CANVAS,
  parent,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  transparent: true,
  pixelArt: true,
  // The connect scene overlays real <input>/<img> DOM nodes (session-id field,
  // QR code) on top of the canvas, which needs the DOM container enabled.
  dom: { createContainer: true },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    StartScene,
    ConnectScene,
    CharacterSelectScene,
    FightScene,
    WinnerScene,
  ],
});
