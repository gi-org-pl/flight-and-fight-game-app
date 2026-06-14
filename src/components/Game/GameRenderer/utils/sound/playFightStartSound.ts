import Phaser from "phaser";

export const playFightStartSound = (scene: Phaser.Scene): void => {
  const ctx = (scene.sound as Phaser.Sound.WebAudioSoundManager).context;
  if (!ctx) return;

  const now = ctx.currentTime;

  // Three dramatic descending hits — classic "VS" fanfare feel
  const hits = [
    { freq: 220, start: 0, duration: 0.14 },
    { freq: 185, start: 0.18, duration: 0.14 },
    { freq: 147, start: 0.36, duration: 0.28 },
  ];

  for (const hit of hits) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "square";
    osc.frequency.setValueAtTime(hit.freq, now + hit.start);

    gain.gain.setValueAtTime(0.28, now + hit.start);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + hit.start + hit.duration,
    );

    osc.start(now + hit.start);
    osc.stop(now + hit.start + hit.duration);
  }

  // Low rumble underneath
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.type = "sawtooth";
  sub.frequency.setValueAtTime(55, now + 0.36);
  sub.frequency.exponentialRampToValueAtTime(30, now + 0.7);
  subGain.gain.setValueAtTime(0.18, now + 0.36);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
  sub.start(now + 0.36);
  sub.stop(now + 0.72);
};
