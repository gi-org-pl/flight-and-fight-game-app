import Phaser from "phaser";

export const playCharacterSelectSound = (scene: Phaser.Scene): void => {
  const ctx = (scene.sound as Phaser.Sound.WebAudioSoundManager).context;
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [330, 523]; // E4 → C5 — a quick confirming two-note rise

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const start = now + i * 0.07;
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.15, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);

    osc.start(start);
    osc.stop(start + 0.09);
  });
};
