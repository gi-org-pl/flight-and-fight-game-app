import Phaser from "phaser";
import { describe, expect, it } from "vitest";
import {
  BACKGROUND_COLOR,
  GAME_HEIGHT,
  GAME_WIDTH,
} from "../GameRenderer.constants";
import { BootScene } from "../scenes/BootScene";
import { createGameConfig } from "./createGameConfig";

describe("createGameConfig", () => {
  describe("when given a parent element", () => {
    it("returns a config sized and coloured from the constants", () => {
      const parent = document.createElement("div");

      const config = createGameConfig(parent);

      expect(config.parent).toBe(parent);
      expect(config.width).toBe(GAME_WIDTH);
      expect(config.height).toBe(GAME_HEIGHT);
      expect(config.backgroundColor).toBe(BACKGROUND_COLOR);
    });

    it("registers the boot scene and auto-detects the renderer", () => {
      const parent = document.createElement("div");

      const config = createGameConfig(parent);

      expect(config.type).toBe(Phaser.AUTO);
      expect(config.scene).toEqual([BootScene]);
    });
  });
});
