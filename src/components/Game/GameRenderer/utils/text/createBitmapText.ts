import type Phaser from "phaser";
import {
  GAME_BITMAP_FONT,
  TEXT_COLOR_NUMBER,
} from "../../GameRenderer.constants";

// Center-anchored `BitmapText` in the baked Press Start 2P font. Drop-in
// replacement for `scene.add.text(...).setOrigin(0.5)`, but crisp under the
// pixelArt upscale. `size` matches the old `fontSize` px (it sets the rendered
// glyph height); `color` tints the white glyph mask. See generateBitmapFont.ts.
export const createBitmapText = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size: number,
  color: number = TEXT_COLOR_NUMBER,
): Phaser.GameObjects.BitmapText => {
  const label = scene.add
    .bitmapText(x, y, GAME_BITMAP_FONT, text, size)
    .setOrigin(0.5);

  if (color !== TEXT_COLOR_NUMBER) {
    label.setTint(color);
  }

  return label;
};
