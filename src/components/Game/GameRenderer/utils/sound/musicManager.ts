import Phaser from "phaser";

const FADE_IN_MS = 1500;
const FADE_OUT_MS = 800;
const MUSIC_VOLUME = 0.1;

let current: Phaser.Sound.WebAudioSound | null = null;
let currentKey: string | null = null;

export const playMusic = (scene: Phaser.Scene, key: string): void => {
  if (currentKey === key && current?.isPlaying) return;

  // Fade out whatever is playing before starting the new track.
  if (current) {
    const outgoing = current;
    scene.tweens.add({
      targets: outgoing,
      volume: 0,
      duration: FADE_OUT_MS,
      ease: "Linear",
      onComplete: () => {
        outgoing.stop();
        outgoing.destroy();
      },
    });
  }

  const track = scene.sound.add(key, {
    loop: true,
    volume: 0,
  }) as Phaser.Sound.WebAudioSound;

  track.play();
  scene.tweens.add({
    targets: track,
    volume: MUSIC_VOLUME,
    duration: FADE_IN_MS,
    ease: "Linear",
  });

  current = track;
  currentKey = key;
};

export const stopMusic = (scene: Phaser.Scene): void => {
  if (!current) return;

  const outgoing = current;
  current = null;
  currentKey = null;

  scene.tweens.add({
    targets: outgoing,
    volume: 0,
    duration: FADE_OUT_MS,
    ease: "Linear",
    onComplete: () => {
      outgoing.stop();
      outgoing.destroy();
    },
  });
};
