import Phaser from "phaser";

export const playHealthDownSound = (scene: Phaser.Scene): void => {
  const ctx = (scene.sound as Phaser.Sound.WebAudioSoundManager).context;
  if (!ctx) return;

  const now = ctx.currentTime;

  // Low descending groan: heavy drop in pitch — the "ouch" feeling
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "square";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);

  gain.gain.setValueAtTime(0.22, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

  osc.start(now);
  osc.stop(now + 0.2);
};
