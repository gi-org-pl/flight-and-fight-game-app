import Phaser from "phaser";

export const playWinnerSound = (scene: Phaser.Scene): void => {
  const ctx = (scene.sound as Phaser.Sound.WebAudioSoundManager).context;
  if (!ctx) return;

  const now = ctx.currentTime;
  // Cheerful ascending victory jingle: C4 E4 G4 C5 E5
  const notes = [262, 330, 392, 523, 659];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const start = now + i * 0.1;
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.18, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);

    osc.start(start);
    osc.stop(start + 0.18);
  });

  // Held high note at the end for triumph
  const held = ctx.createOscillator();
  const heldGain = ctx.createGain();
  held.connect(heldGain);
  heldGain.connect(ctx.destination);
  held.type = "square";
  held.frequency.setValueAtTime(659, now + notes.length * 0.1);
  heldGain.gain.setValueAtTime(0.22, now + notes.length * 0.1);
  heldGain.gain.exponentialRampToValueAtTime(0.0001, now + notes.length * 0.1 + 0.5);
  held.start(now + notes.length * 0.1);
  held.stop(now + notes.length * 0.1 + 0.5);
};
