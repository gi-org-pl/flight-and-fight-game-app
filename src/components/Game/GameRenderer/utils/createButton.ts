import Phaser from "phaser";
import { BEVEL, GAME_PALETTE } from "../GameRenderer.constants";
import { createBitmapText } from "./createBitmapText";
import { darkenColor } from "./darkenColor";

export interface ButtonOptions {
  width?: number;
  height?: number;
  fill?: number;
  fontSize?: number;
  onClick: () => void;
}

const DEFAULT_WIDTH = 160;
const DEFAULT_HEIGHT = 30;
const DEFAULT_FONT_SIZE = 10;
const HOVER_BEVEL = BEVEL + 1;

// NES.css-style button: a flat fill with a hard pixel bevel along the
// bottom/right edge. Hovering thickens the bevel and pressing flips it to the
// top/left so the button reads as physically depressed — the same feedback as
// `.nes-btn` (`inset -4px -4px` → `inset -6px -6px` on hover → `inset 4px 4px`
// while active).
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
    fontSize = DEFAULT_FONT_SIZE,
    onClick,
  } = options;

  const shadow = darkenColor(fill);
  const background = scene.add.rectangle(0, 0, width, height, fill);
  const bevelBottom = scene.add.rectangle(0, 0, width, BEVEL, shadow);
  const bevelRight = scene.add.rectangle(0, 0, BEVEL, height, shadow);
  const text = createBitmapText(scene, 0, 0, label, fontSize);

  // Lay the two bevel strips along one corner and nudge the label toward the
  // raised side. `pressed` flips both to the opposite corner.
  const layoutBevel = (size: number, pressed: boolean): void => {
    const sign = pressed ? -1 : 1;
    bevelBottom
      .setSize(width, size)
      .setPosition(0, sign * (height - size) * 0.5);
    bevelRight
      .setSize(size, height)
      .setPosition(sign * (width - size) * 0.5, 0);
    text.setPosition(sign * -BEVEL * 0.5, sign * -BEVEL * 0.5);
  };
  layoutBevel(BEVEL, false);

  const container = scene.add.container(x, y, [
    background,
    bevelBottom,
    bevelRight,
    text,
  ]);
  container.setSize(width, height);
  container.setInteractive({ useHandCursor: true });
  container.on("pointerover", () => layoutBevel(HOVER_BEVEL, false));
  container.on("pointerout", () => layoutBevel(BEVEL, false));
  container.on("pointerdown", () => layoutBevel(BEVEL, true));
  container.on("pointerup", () => {
    layoutBevel(BEVEL, false);
    onClick();
  });

  return container;
};
