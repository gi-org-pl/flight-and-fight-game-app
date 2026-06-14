import Phaser from "phaser";

export const playSuperpowerSound = (scene: Phaser.Scene): void => {
  const ctx = (scene.sound as Phaser.Sound.WebAudioSoundManager).context;
  if (!ctx) return;

  const now = ctx.currentTime;
  // Rising arpeggio: C4 → E4 → G4 → C5 — magical power-up feel
  const notes = [262, 330, 392, 523];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const start = now + i * 0.06;
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, start);
    // Slight upward pitch sweep on each note for extra energy
    osc.frequency.exponentialRampToValueAtTime(freq * 1.08, start + 0.1);

    gain.gain.setValueAtTime(0.18, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);

    osc.start(start);
    osc.stop(start + 0.14);
  });

  // Low rumble under the arpeggio
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.type = "sawtooth";
  sub.frequency.setValueAtTime(80, now);
  sub.frequency.exponentialRampToValueAtTime(40, now + 0.32);
  subGain.gain.setValueAtTime(0.12, now);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
  sub.start(now);
  sub.stop(now + 0.32);
};
