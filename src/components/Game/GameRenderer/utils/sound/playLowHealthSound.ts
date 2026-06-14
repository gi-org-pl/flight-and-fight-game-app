import Phaser from 'phaser';

export const playLowHealthSound = (scene: Phaser.Scene): void => {
  const ctx = (scene.sound as Phaser.Sound.WebAudioSoundManager).context;
  if (!ctx) return;

  const now = ctx.currentTime;
  // Two urgent short beeps — like a warning alarm
  // biome-ignore lint/complexity/noForEach: no time to improve
  [0, 0.14].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now + offset);

    gain.gain.setValueAtTime(0.2, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.1);

    osc.start(now + offset);
    osc.stop(now + offset + 0.1);
  });
};
