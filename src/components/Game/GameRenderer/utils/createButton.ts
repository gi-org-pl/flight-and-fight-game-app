import Phaser from "phaser";
import { GAME_FONT, GAME_PALETTE, TEXT_COLOR } from "../GameRenderer.constants";

export interface ButtonOptions {
  width?: number;
  height?: number;
  fill?: number;
  fontSize?: string;
  onClick: () => void;
}

const DEFAULT_WIDTH = 280;
const DEFAULT_HEIGHT = 56;

// Minimal wireframe button: a filled rectangle with a centred label.
export const createButton = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  options: ButtonOptions,
): Phaser.GameObjects.Container => {
  const {
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    fill = GAME_PALETTE.LAVENDER,
    fontSize = "16px",
    onClick,
  } = options;

  const background = scene.add
    .rectangle(0, 0, width, height, fill)
    .setStrokeStyle(2, GAME_PALETTE.BLUSH);
  const text = scene.add
    .text(0, 0, label, { fontFamily: GAME_FONT, fontSize, color: TEXT_COLOR })
    .setOrigin(0.5);

  const container = scene.add.container(x, y, [background, text]);
  container.setSize(width, height);
  container.setInteractive({ useHandCursor: true });
  container.on("pointerover", () => background.setAlpha(0.8));
  container.on("pointerout", () => background.setAlpha(1));
  container.on("pointerup", onClick);

  return container;
};
