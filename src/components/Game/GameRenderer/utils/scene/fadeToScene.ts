import type Phaser from "phaser";

export const fadeToScene = (
  scene: Phaser.Scene,
  key: string,
  data?: object,
  duration = 400,
): void => {
  scene.cameras.main.fadeOut(duration, 0, 0, 0);
  scene.cameras.main.once("camerafadeoutcomplete", () => {
    scene.scene.start(key, data);
  });
};
