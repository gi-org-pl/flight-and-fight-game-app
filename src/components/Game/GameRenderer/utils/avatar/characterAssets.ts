import Phaser from "phaser";
import auraAvatar from "@/assets/images/characters/avatar/aura.png?url";
import galeAvatar from "@/assets/images/characters/avatar/gale.png?url";
import irisAvatar from "@/assets/images/characters/avatar/iris.png?url";
import neilAvatar from "@/assets/images/characters/avatar/neil.png?url";
import skyeAvatar from "@/assets/images/characters/avatar/skye.png?url";
import sunnyAvatar from "@/assets/images/characters/avatar/sunny.png?url";
import thoraAvatar from "@/assets/images/characters/avatar/thora.png?url";
import vegaAvatar from "@/assets/images/characters/avatar/vega.png?url";
import wendyAvatar from "@/assets/images/characters/avatar/wendy.png?url";
import zephyrAvatar from "@/assets/images/characters/avatar/zephyr.png?url";
import avatarBg from "@/assets/images/characters/avatar/background.png?url";
import auraSprite from "@/assets/images/characters/sprite/aura.gif?url";
import galeSprite from "@/assets/images/characters/sprite/gale.gif?url";
import irisSprite from "@/assets/images/characters/sprite/iris.gif?url";
import neilSprite from "@/assets/images/characters/sprite/neil.gif?url";
import skyeSprite from "@/assets/images/characters/sprite/skye.gif?url";
import sunnySprite from "@/assets/images/characters/sprite/sunny.gif?url";
import thoraSprite from "@/assets/images/characters/sprite/thora.gif?url";
import vegaSprite from "@/assets/images/characters/sprite/vega.gif?url";
import wendySprite from "@/assets/images/characters/sprite/wendy.gif?url";
import zephyrSprite from "@/assets/images/characters/sprite/zephyr.gif?url";
import { loadGifAnimation } from "./loadGifAnimation";

const AVATAR_URLS: Record<string, string> = {
  aura: auraAvatar,
  gale: galeAvatar,
  iris: irisAvatar,
  neil: neilAvatar,
  skye: skyeAvatar,
  sunny: sunnyAvatar,
  thora: thoraAvatar,
  vega: vegaAvatar,
  wendy: wendyAvatar,
  zephyr: zephyrAvatar,
};

export const SPRITE_URLS: Record<string, string> = {
  aura: auraSprite,
  gale: galeSprite,
  iris: irisSprite,
  neil: neilSprite,
  skye: skyeSprite,
  sunny: sunnySprite,
  thora: thoraSprite,
  vega: vegaSprite,
  wendy: wendySprite,
  zephyr: zephyrSprite,
};

export const AVATAR_BG_KEY = "character-avatar-bg";

/** Stable texture cache key for a character's avatar image. */
export const avatarTextureKey = (type: string): string =>
  `avatar-${type.toLowerCase()}`;

/** Stable texture cache key for a character's sprite animation. */
export const spriteTextureKey = (type: string): string =>
  `sprite-${type.toLowerCase()}`;

/** Load avatar PNGs and background via the Phaser loader. Call in preload(). */
export const loadAvatarAssets = (scene: Phaser.Scene): void => {
  scene.load.image(AVATAR_BG_KEY, avatarBg);
  for (const [name, url] of Object.entries(AVATAR_URLS)) {
    scene.load.image(avatarTextureKey(name), url);
  }
};

/**
 * Decode all sprite GIFs and register them as Phaser spritesheet textures +
 * animations. Must run after the scene is active (create(), not preload()).
 */
export const loadSpriteAnimations = (scene: Phaser.Scene): Promise<void[]> =>
  Promise.all(
    Object.entries(SPRITE_URLS).map(([name, url]) =>
      loadGifAnimation(scene, spriteTextureKey(name), url),
    ),
  );
