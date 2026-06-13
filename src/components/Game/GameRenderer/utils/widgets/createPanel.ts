import Phaser from "phaser";
import { BEVEL } from "../../GameRenderer.constants";
import { darkenColor } from "../color/darkenColor";

export interface PanelOptions {
  shadow?: number;
  bevel?: number;
}

export interface Panel {
  base: Phaser.GameObjects.Rectangle;
  parts: Phaser.GameObjects.Rectangle[];
}

// NES.css-style panel: a flat fill carrying the same hard bottom/right bevel as
// the buttons, so character cards and fighter frames read like `.nes-container`
// surfaces instead of thin outlined boxes. Returns base (for interaction/recolor)
// and all parts (for alpha tweens that must include the bevel strips).
export const createPanel = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: number,
  options: PanelOptions = {},
): Panel => {
  const { shadow = darkenColor(fill), bevel = BEVEL } = options;

  const base = scene.add.rectangle(x, y, width, height, fill);
  const bevelBottom = scene.add.rectangle(x, y + (height - bevel) * 0.5, width, bevel, shadow);
  const bevelRight = scene.add.rectangle(x + (width - bevel) * 0.5, y, bevel, height, shadow);

  return { base, parts: [base, bevelBottom, bevelRight] };
};
