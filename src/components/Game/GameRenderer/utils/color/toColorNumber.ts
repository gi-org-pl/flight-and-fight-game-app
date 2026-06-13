// Converts a CSS hex string (e.g. "#aabbcc") into the 0xRRGGBB integer Phaser
// expects for fills and tints.
export const toColorNumber = (hex: string): number =>
  Number.parseInt(hex.slice(1), 16);
