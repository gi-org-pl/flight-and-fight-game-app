import Phaser from "phaser";
import { GAME_FONT } from "../GameRenderer.constants";
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

    // A `?join_id=` deep link (e.g. a scanned share QR) skips the menu and drops
    // straight into the connect scene to auto-join that session.
    const joinId = readJoinId(globalThis.location.search);
    if (joinId) {
      this.scene.start(CONNECT_SCENE_KEY, {
        mode: "multiplayer",
        autoJoinId: joinId,
      });
      return;
    }

    this.scene.start(START_SCENE_KEY);
  }
}
