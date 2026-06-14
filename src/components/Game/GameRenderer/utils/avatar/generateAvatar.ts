import Phaser from "phaser";
import type { CharacterResponse } from "@/services/api/schemas/character";
import { AVATAR_GRID, buildAvatarPattern } from "./buildAvatarPattern";

// Each avatar cell is baked this many texture pixels square. The texture is
// registered with NEAREST filtering so it stays crisp under the pixelArt
// upscale, like the bitmap font.
const CELL_PX = 8;
const TEXTURE_PX = AVATAR_GRID * CELL_PX;

/** Stable texture cache key for a character's placeholder avatar. */
export const avatarTextureKey = (id: string): string => `avatar-${id}`;

const bakeAvatar = (
  scene: Phaser.Scene,
  character: CharacterResponse,
): void => {
  const key = avatarTextureKey(character.type);
  if (scene.textures.exists(key)) {
    return;
  }

  const { cells, foreground, background } = buildAvatarPattern(character.type);
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_PX;
  canvas.height = TEXTURE_PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, TEXTURE_PX, TEXTURE_PX);

  ctx.fillStyle = foreground;
  cells.forEach((row, rowIndex) => {
    row.forEach((filled, columnIndex) => {
      if (filled) {
        ctx.fillRect(
          columnIndex * CELL_PX,
          rowIndex * CELL_PX,
          CELL_PX,
          CELL_PX,
        );
      }
    });
  });

  const texture = scene.textures.addCanvas(key, canvas);
  texture?.setFilter(Phaser.Textures.FilterMode.NEAREST);
};

/**
 * Bake a placeholder avatar texture for every character once, in the BootScene.
 * Textures are game-global, so later scenes just reference them by
 * `avatarTextureKey(id)`. Real character art will replace these later.
 */
export const generateAvatarTextures = (
  scene: Phaser.Scene,
  characters: CharacterResponse[],
): void => {
  for (const character of characters) {
    bakeAvatar(scene, character);
  }
};
