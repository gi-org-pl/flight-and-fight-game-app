import Phaser from "phaser";
import homeBgLayer1 from "@/assets/images/home/layer-1.png?url";
import homeBgLayer2 from "@/assets/images/home/layer-2.png?url";
import homeBgLayer3 from "@/assets/images/home/layer-3.png?url";
import homeBgLayer4 from "@/assets/images/home/layer-4.png?url";
import lobbyMp3 from "@/assets/sounds/lobby.mp3?url";
import fightMp3 from "@/assets/sounds/fight.mp3?url";
import { getCharacters } from "@/services/api/characters";
import {
  GAME_FONT,
  HOME_BG_LAYER_KEYS,
  MUSIC_KEY_FIGHT,
  MUSIC_KEY_LOBBY,
} from "../GameRenderer.constants";
import {
  loadAvatarAssets,
  loadSpriteAnimations,
} from "../utils/avatar/characterAssets";
import { readJoinId } from "../utils/connect/readJoinId";
import { generateBitmapFont } from "../utils/text/generateBitmapFont";
import {
  BOOT_SCENE_KEY,
  CONNECT_SCENE_KEY,
  START_SCENE_KEY,
} from "./sceneKeys";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(BOOT_SCENE_KEY);
  }

  preload(): void {
    const layerUrls = [homeBgLayer1, homeBgLayer2, homeBgLayer3, homeBgLayer4];
    for (const [i, url] of layerUrls.entries()) {
      this.load.image(HOME_BG_LAYER_KEYS[i], url);
    }
    this.load.audio(MUSIC_KEY_LOBBY, lobbyMp3);
    this.load.audio(MUSIC_KEY_FIGHT, fightMp3);
    loadAvatarAssets(this);
  }

  // Bake the bitmap font from the web font before any scene renders text, then
  // hand off to the menu. We wait on the font load so rasterization captures the
  // real glyphs rather than a fallback face.
  async create(): Promise<void> {
    try {
      await document.fonts.load(`16px "${GAME_FONT}"`);
    } catch {
      // Fall through: generateBitmapFont rasterizes whatever face is available.
    }

    // The scene can be torn down while suspended on the await above — e.g. React
    // StrictMode remounts the host and destroys this game. Bail if so; touching
    // the cache on a dead scene throws.
    if (!this.sys.isActive()) {
      return;
    }

    generateBitmapFont(this);

    await loadSpriteAnimations(this);

    if (!this.sys.isActive()) {
      return;
    }

    const characters = await getCharacters();

    // A `?join_id=` deep link (e.g. a scanned share QR) skips the menu and drops
    // straight into the connect scene to auto-join that session.
    const joinId = readJoinId(globalThis.location.search);
    if (joinId) {
      this.scene.start(CONNECT_SCENE_KEY, {
        mode: "multiplayer",
        characters,
        autoJoinId: joinId,
      });
      return;
    }

    this.scene.start(START_SCENE_KEY, { characters });
  }
}
