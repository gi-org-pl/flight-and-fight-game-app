import Phaser from "phaser";
import type { Superpower } from "@/services/api/schemas/character";

// --- Fallback: generic punchy thud + noise crunch ----------------------------
const playGenericAttack = (ctx: AudioContext): void => {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "square";
  osc.frequency.setValueAtTime(280, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.07);
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  osc.start(now);
  osc.stop(now + 0.12);

  const bufferSize = Math.floor(ctx.sampleRate * 0.06);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  const noiseGain = ctx.createGain();
  noise.buffer = buffer;
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseGain.gain.setValueAtTime(0.18, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  noise.start(now);
};

// --- Helpers -----------------------------------------------------------------

const osc = (
  ctx: AudioContext,
  type: OscillatorType,
  freq: number,
  startFreq: number | null,
  endFreq: number,
  startGain: number,
  duration: number,
  delay = 0,
): void => {
  const now = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g);
  g.connect(ctx.destination);
  o.type = type;
  o.frequency.setValueAtTime(startFreq ?? freq, now);
  o.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
  g.gain.setValueAtTime(startGain, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  o.start(now);
  o.stop(now + duration);
};

const noise = (
  ctx: AudioContext,
  gainValue: number,
  duration: number,
  delay = 0,
): void => {
  const now = ctx.currentTime + delay;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  src.buffer = buffer;
  src.connect(g);
  g.connect(ctx.destination);
  g.gain.setValueAtTime(gainValue, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  src.start(now);
};

// --- Per-element sounds -------------------------------------------------------

const SOUNDS: Record<Superpower, (ctx: AudioContext) => void> = {
  // Bright high-pitched crack + shimmer
  LIGHT: (ctx) => {
    osc(ctx, "square", 880, 1200, 440, 0.2, 0.1);
    osc(ctx, "sine", 1760, null, 880, 0.1, 0.14, 0.02);
  },

  // Deep hollow thud + low rumble — heavy, ominous
  DARK: (ctx) => {
    osc(ctx, "sawtooth", 80, 120, 30, 0.3, 0.22);
    osc(ctx, "square", 55, null, 28, 0.18, 0.3, 0.05);
  },

  // Liquid splash: rising then falling sine with noise
  WATER: (ctx) => {
    osc(ctx, "sine", 400, 200, 800, 0.2, 0.08);
    osc(ctx, "sine", 800, null, 300, 0.12, 0.18, 0.06);
    noise(ctx, 0.08, 0.1, 0.04);
  },

  // Soft rustling thump — mid-frequency square + filtered noise
  GRASS: (ctx) => {
    osc(ctx, "square", 180, 260, 100, 0.2, 0.14);
    noise(ctx, 0.1, 0.12);
  },

  // Sharp crack + roar — fast high-to-low sweep, noise burst
  FIRE: (ctx) => {
    osc(ctx, "sawtooth", 600, 900, 80, 0.28, 0.15);
    noise(ctx, 0.22, 0.18);
    osc(ctx, "square", 200, null, 60, 0.15, 0.2, 0.05);
  },

  // Buzzy zap — rapid square wave with fast frequency wobble
  ELECTRIC: (ctx) => {
    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "square";
      const f = 440 + i * 220;
      o.frequency.setValueAtTime(f, now + i * 0.025);
      o.frequency.exponentialRampToValueAtTime(f * 0.4, now + i * 0.025 + 0.05);
      g.gain.setValueAtTime(0.15, now + i * 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.025 + 0.05);
      o.start(now + i * 0.025);
      o.stop(now + i * 0.025 + 0.05);
    }
    noise(ctx, 0.12, 0.12);
  },

  // Heavy stone slam — very low thud + rumble tail
  GROUND: (ctx) => {
    osc(ctx, "sawtooth", 60, 100, 25, 0.35, 0.28);
    noise(ctx, 0.25, 0.2);
    osc(ctx, "square", 40, null, 20, 0.2, 0.35, 0.08);
  },

  // Whoosh — mid sine sweep upward + airy noise
  AIR: (ctx) => {
    osc(ctx, "sine", 200, 150, 600, 0.18, 0.2);
    noise(ctx, 0.12, 0.22);
    osc(ctx, "sine", 400, null, 900, 0.08, 0.16, 0.06);
  },

  // Cold crystalline crack — high square + descending shimmer
  ICE: (ctx) => {
    osc(ctx, "square", 660, 900, 330, 0.2, 0.1);
    osc(ctx, "sine", 1320, null, 440, 0.1, 0.18, 0.04);
    noise(ctx, 0.06, 0.08, 0.02);
  },
};

// -----------------------------------------------------------------------------

export const playAttackSound = (
  scene: Phaser.Scene,
  superpower?: Superpower,
): void => {
  const ctx = (scene.sound as Phaser.Sound.WebAudioSoundManager).context;
  if (!ctx) return;

  if (superpower && superpower in SOUNDS) {
    SOUNDS[superpower](ctx);
  } else {
    playGenericAttack(ctx);
  }
};
