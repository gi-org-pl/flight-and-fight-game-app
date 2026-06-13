import Phaser from "phaser";
import {
  BACKGROUND_COLOR,
  GAME_HEIGHT,
  GAME_WIDTH,
} from "../../GameRenderer.constants";
import { BootScene } from "../../scenes/BootScene";
import { CharacterSelectScene } from "../../scenes/CharacterSelectScene";
import { FightScene } from "../../scenes/FightScene";
import { MatchmakingScene } from "../../scenes/MatchmakingScene";
import { StartScene } from "../../scenes/StartScene";
import { WinnerScene } from "../../scenes/WinnerScene";

export const createGameConfig = (
  parent: HTMLElement,
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.CANVAS,
  parent,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: BACKGROUND_COLOR,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    StartScene,
    MatchmakingScene,
    CharacterSelectScene,
    FightScene,
    WinnerScene,
  ],
});
