import Phaser from "phaser";
import { BEVEL } from "../../GameRenderer.constants";
import { darkenColor } from "../color/darkenColor";

export interface PanelOptions {
  shadow?: number;
  bevel?: number;
}

// NES.css-style panel: a flat fill carrying the same hard bottom/right bevel as
// the buttons, so character cards and fighter frames read like `.nes-container`
// surfaces instead of thin outlined boxes. Returns the fill rectangle so callers
// can keep recolouring it (e.g. selection state) and wire up interaction.
export const createPanel = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: number,
  options: PanelOptions = {},
): Phaser.GameObjects.Rectangle => {
  const { shadow = darkenColor(fill), bevel = BEVEL } = options;

  const base = scene.add.rectangle(x, y, width, height, fill);
  // Inset bevel along the bottom and right edges, drawn over the fill.
  scene.add.rectangle(x, y + (height - bevel) * 0.5, width, bevel, shadow);
  scene.add.rectangle(x + (width - bevel) * 0.5, y, bevel, height, shadow);

  return base;
};
