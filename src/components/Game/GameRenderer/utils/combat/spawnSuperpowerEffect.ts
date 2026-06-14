import type Phaser from "phaser";
import type { Superpower } from "@/services/api/schemas/character";

interface EffectConfig {
  colors: number[];
  count: number;
  speed: number;
  steps: number;
  stepMs: number;
  sizes: number[];
  // Bias angle in radians: undefined = full radial, Math.PI*1.5 = upward, etc.
  angleBias?: number;
  // How wide the spread cone is (radians). Full circle = Math.PI*2.
  spread?: number;
}

const EFFECT: Record<Superpower, EffectConfig> = {
  LIGHT: {
    colors: [0xff_ff_ff, 0xff_ff_aa, 0xff_ee_55],
    count: 14,
    speed: 30,
    steps: 7,
    stepMs: 55,
    sizes: [2, 2, 3],
  },
  DARK: {
    colors: [0x88_00_cc, 0x44_00_88, 0xcc_55_ff, 0x22_00_44],
    count: 12,
    speed: 22,
    steps: 8,
    stepMs: 70,
    sizes: [2, 3, 3],
  },
  FIRE: {
    colors: [0xff_55_00, 0xff_99_00, 0xff_dd_44, 0xff_33_00],
    count: 16,
    speed: 28,
    steps: 7,
    stepMs: 50,
    sizes: [2, 2, 3],
    angleBias: Math.PI * 1.5, // upward
    spread: Math.PI * 1.1,
  },
  WATER: {
    colors: [0x44_aa_ff, 0x00_77_cc, 0xaa_dd_ff, 0x00_55_99],
    count: 14,
    speed: 24,
    steps: 8,
    stepMs: 65,
    sizes: [2, 2, 3],
    angleBias: Math.PI * 0.5, // downward
    spread: Math.PI * 1.4,
  },
  GRASS: {
    colors: [0x44_cc_44, 0x22_88_22, 0x88_ee_44, 0x00_aa_22],
    count: 13,
    speed: 26,
    steps: 7,
    stepMs: 60,
    sizes: [2, 2, 3],
  },
  ELECTRIC: {
    colors: [0xff_ff_00, 0xff_ee_44, 0xff_cc_00, 0xff_ff_99],
    count: 18,
    speed: 36,
    steps: 5,
    stepMs: 40,
    sizes: [2, 3],
  },
  ICE: {
    colors: [0xaa_ee_ff, 0x55_cc_ff, 0xff_ff_ff, 0x88_dd_ff],
    count: 14,
    speed: 20,
    steps: 9,
    stepMs: 65,
    sizes: [2, 2, 3],
  },
  GROUND: {
    colors: [0xaa_77_33, 0x88_55_22, 0xcc_aa_55, 0xff_cc_77],
    count: 14,
    speed: 22,
    steps: 7,
    stepMs: 60,
    sizes: [2, 3, 3],
    angleBias: Math.PI * 0.5, // falls downward
    spread: Math.PI * 1.6,
  },
  AIR: {
    colors: [0xcc_ee_ff, 0x99_dd_ff, 0xff_ff_ff, 0xaa_cc_ff],
    count: 16,
    speed: 32,
    steps: 8,
    stepMs: 55,
    sizes: [2, 2, 2, 3],
  },
};

/**
 * Spawn a one-shot pixel-art particle burst at (cx, cy) matching the
 * attacker's superpower type. Uses integer-snapped step animation to
 * stay consistent with the game's pixel-art aesthetic.
 */
export const spawnSuperpowerEffect = (
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  superpower: Superpower,
): void => {
  const cfg = EFFECT[superpower];
  const fullSpread = cfg.spread ?? Math.PI * 2;
  const bias = cfg.angleBias ?? 0;

  for (let i = 0; i < cfg.count; i++) {
    const angle = bias - fullSpread / 2 + Math.random() * fullSpread;
    const dist = cfg.speed * (0.6 + Math.random() * 0.4);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const size = cfg.sizes[Math.floor(Math.random() * cfg.sizes.length)];
    const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];

    const px = Math.round(cx + (Math.random() - 0.5) * 6);
    const py = Math.round(cy + (Math.random() - 0.5) * 6);

    const particle = scene.add.rectangle(px, py, size, size, color).setDepth(8);

    for (let s = 1; s <= cfg.steps; s++) {
      const step = s;
      scene.time.delayedCall(step * cfg.stepMs, () => {
        if (!particle.active) return;
        if (step === cfg.steps) {
          particle.destroy();
          return;
        }
        particle.setPosition(
          Math.round(px + (dx * step) / cfg.steps),
          Math.round(py + (dy * step) / cfg.steps),
        );
        // Discrete alpha: full → half at midpoint → gone.
        const progress = step / cfg.steps;
        particle.setAlpha(progress < 0.45 ? 1 : progress < 0.75 ? 0.5 : 0.2);
      });
    }
  }
};
