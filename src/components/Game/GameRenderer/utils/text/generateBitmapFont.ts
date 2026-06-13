import Phaser from "phaser";
import { GAME_BITMAP_FONT, GAME_FONT } from "../../GameRenderer.constants";

// Native pixel size each glyph is rasterized at. The 480x270 buffer is upscaled
// ~4-5x by the browser with nearest-neighbor (pixelArt), so what the atlas must
// provide is *crisp*, un-anti-aliased glyphs. We draw the web font once then
// hard-threshold the alpha to a 1-bit mask, so no soft edge survives to be
// magnified into blur. Press Start 2P is monospaced with an advance equal to the
// font size and no ink below the baseline, so a square NATIVE_PX cell holds every
// glyph exactly (verified by pixel-scanning the rendered range).
const NATIVE_PX = 16;
const CHARS_PER_ROW = 16;
const FIRST_CODE = 32; // space
const LAST_CODE = 126; // ~
const ALPHA_THRESHOLD = 128;
// Transparent dead space between cells. Glyph ink reaches the top/left edge of
// its cell, and the next glyph sits one cell away; without a gap, the
// nearest-neighbor sampler grabs a neighbour's edge texel when a frame is
// rendered at a fractional scale, painting stray ticks. A 2px gutter keeps every
// frame's edges clear so no neighbour ink bleeds in.
const GUTTER = 2;

const buildCharset = (): string => {
  let chars = "";
  for (let code = FIRST_CODE; code <= LAST_CODE; code += 1) {
    chars += String.fromCharCode(code);
  }
  return chars;
};

// Rasterize "Press Start 2P" into a 1-bit glyph atlas and register it as a
// monospaced RetroFont. Phaser `BitmapText` samples this atlas nearest-neighbor,
// so text stays pixel-crisp at any scale — unlike `Text`, whose anti-aliased
// glyphs blur once the low-res canvas is upscaled. Runs once in the BootScene
// after the web font has loaded; the texture and font cache are game-global.
export const generateBitmapFont = (scene: Phaser.Scene): void => {
  if (scene.cache.bitmapFont.has(GAME_BITMAP_FONT)) {
    return;
  }

  const chars = buildCharset();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  // Square monospaced cell: NATIVE_PX tall (the font's ascent, with no descent)
  // and as wide as a glyph advance. The baseline sits on the cell's bottom edge.
  ctx.font = `${NATIVE_PX}px "${GAME_FONT}"`;
  const cellWidth = Math.ceil(ctx.measureText("M").width);
  const cellHeight = NATIVE_PX;
  const strideX = cellWidth + GUTTER;
  const strideY = cellHeight + GUTTER;

  const rows = Math.ceil(chars.length / CHARS_PER_ROW);
  canvas.width = strideX * CHARS_PER_ROW;
  canvas.height = strideY * rows;

  // Resizing the canvas reset the context, so re-apply the draw state.
  ctx.font = `${NATIVE_PX}px "${GAME_FONT}"`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";

  [...chars].forEach((char, index) => {
    const column = index % CHARS_PER_ROW;
    const row = Math.floor(index / CHARS_PER_ROW);
    ctx.fillText(char, column * strideX, row * strideY + cellHeight);
  });

  // Collapse anti-aliased edges to a hard 1-bit mask: pixels above the alpha
  // threshold become solid white, the rest fully transparent. Forcing the RGB
  // to white lets `setTint` recolor glyphs later.
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    const opaque = data[i + 3] >= ALPHA_THRESHOLD;
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = opaque ? 255 : 0;
  }
  ctx.putImageData(image, 0, 0);

  const texture = scene.textures.addCanvas(GAME_BITMAP_FONT, canvas);
  texture?.setFilter(Phaser.Textures.FilterMode.NEAREST);

  const fontData = Phaser.GameObjects.RetroFont.Parse(scene, {
    image: GAME_BITMAP_FONT,
    "offset.x": 0,
    "offset.y": 0,
    width: cellWidth,
    height: cellHeight,
    chars,
    charsPerRow: CHARS_PER_ROW,
    "spacing.x": GUTTER,
    "spacing.y": GUTTER,
    lineSpacing: 0,
  });
  scene.cache.bitmapFont.add(GAME_BITMAP_FONT, fontData);
};
