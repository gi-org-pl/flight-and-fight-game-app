import Phaser from "phaser";
import homeBg from "@/assets/images/home/main-bg.png?url";
import { getCharacters } from "@/services/api/characters";
import { GAME_FONT, HOME_BG_KEY } from "../GameRenderer.constants";
import type { GameCharacter } from "../GameRenderer.types";
import { generateAvatarTextures } from "../utils/avatar/generateAvatar";
import { readJoinId } from "../utils/connect/readJoinId";
import { generateBitmapFont } from "../utils/text/generateBitmapFont";
import {
  BOOT_SCENE_KEY,
  CONNECT_SCENE_KEY,
  START_SCENE_KEY,
} from "./sceneKeys";

const toDisplayName = (type: string): string =>
  type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

export class BootScene extends Phaser.Scene {
  constructor() {
    super(BOOT_SCENE_KEY);
  }

  preload(): void {
    this.load.image(HOME_BG_KEY, homeBg);
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

    const apiCharacters = await getCharacters();
    const characters: GameCharacter[] = apiCharacters.map((c) => ({
      id: c.type,
      name: c.name ?? toDisplayName(c.type),
      stats: c.stats,
    }));

    generateAvatarTextures(this, characters);

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
