import Phaser from "phaser";

export const playLoserSound = (scene: Phaser.Scene): void => {
  const ctx = (scene.sound as Phaser.Sound.WebAudioSoundManager).context;
  if (!ctx) return;

  const now = ctx.currentTime;
  // Sad descending melody: G4 E4 D4 C4 — slow and deflating
  const notes = [392, 330, 294, 262];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const start = now + i * 0.18;
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, start);
    // Droop each note slightly for the "wah wah" feel
    osc.frequency.exponentialRampToValueAtTime(freq * 0.92, start + 0.22);

    gain.gain.setValueAtTime(0.16, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

    osc.start(start);
    osc.stop(start + 0.22);
  });

  // Long low drone at the end
  const drone = ctx.createOscillator();
  const droneGain = ctx.createGain();
  drone.connect(droneGain);
  droneGain.connect(ctx.destination);
  drone.type = "sawtooth";
  drone.frequency.setValueAtTime(130, now + notes.length * 0.18);
  drone.frequency.exponentialRampToValueAtTime(
    80,
    now + notes.length * 0.18 + 0.6,
  );
  droneGain.gain.setValueAtTime(0.12, now + notes.length * 0.18);
  droneGain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + notes.length * 0.18 + 0.6,
  );
  drone.start(now + notes.length * 0.18);
  drone.stop(now + notes.length * 0.18 + 0.6);
};
