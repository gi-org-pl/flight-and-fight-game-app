import { decompressFrames, parseGIF } from "gifuct-js";
import Phaser from "phaser";

/**
 * Fetch a GIF, decode its frames, bake them into a Phaser spritesheet texture,
 * and register a looping animation under the same key.
 *
 * Must be called after the scene is active (e.g. in create()), not in preload().
 */
export async function loadGifAnimation(
  scene: Phaser.Scene,
  key: string,
  url: string,
): Promise<void> {
  if (scene.textures.exists(key)) {
    return;
  }

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const gif = parseGIF(buffer);
  const frames = decompressFrames(gif, true);

  if (frames.length === 0) {
    return;
  }

  const { width, height } = gif.lsd;

  // Composite canvas — we redraw each frame patch on top of the previous state.
  const frameCanvas = document.createElement("canvas");
  frameCanvas.width = width;
  frameCanvas.height = height;
  const ctx = frameCanvas.getContext("2d");
  if (!ctx) {
    return;
  }

  // Atlas canvas — all frames laid out horizontally side by side.
  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = width * frames.length;
  atlasCanvas.height = height;
  const atlasCtx = atlasCanvas.getContext("2d");
  if (!atlasCtx) {
    return;
  }

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];

    // Disposal type 2 = clear the frame area before drawing the next patch.
    if (frame.disposalType === 2) {
      ctx.clearRect(
        frame.dims.left,
        frame.dims.top,
        frame.dims.width,
        frame.dims.height,
      );
    }

    // Copy into a plain ArrayBuffer to satisfy the ImageData constructor —
    // gifuct-js may hand back a Uint8ClampedArray backed by SharedArrayBuffer.
    const patchCopy = new Uint8ClampedArray(frame.patch);
    const imageData = new ImageData(
      patchCopy,
      frame.dims.width,
      frame.dims.height,
    );
    ctx.putImageData(imageData, frame.dims.left, frame.dims.top);

    atlasCtx.drawImage(frameCanvas, i * width, 0);
  }

  // addSpriteSheet requires HTMLImageElement, not a canvas — convert via data URL.
  const atlasImage = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = atlasCanvas.toDataURL();
  });

  scene.textures.addSpriteSheet(key, atlasImage, {
    frameWidth: width,
    frameHeight: height,
  });

  // gifuct-js returns delay already converted to milliseconds.
  const delayMs = frames[0].delay || 100;
  const frameRate = Math.max(1, Math.round(1000 / delayMs));

  scene.anims.create({
    key,
    frames: scene.anims.generateFrameNumbers(key, {
      start: 0,
      end: frames.length - 1,
    }),
    frameRate,
    repeat: -1,
  });
}
