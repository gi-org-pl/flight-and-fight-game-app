import Phaser from "phaser";
import { BOOT_SCENE_KEY, START_SCENE_KEY } from "./sceneKeys";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(BOOT_SCENE_KEY);
  }

  // Entry scene reserved for future asset preloading; hands off to the menu.
  create(): void {
    this.scene.start(START_SCENE_KEY);
  }
}
