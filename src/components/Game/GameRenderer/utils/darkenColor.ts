// Derives the darker bevel shade from a fill colour, the way NES.css pairs each
// button colour with a darker shadow (e.g. primary #209cee with #006bb3).
export const darkenColor = (color: number, factor = 0.55): number => {
  const r = Math.round(((color >> 16) & 0xff) * factor);
  const g = Math.round(((color >> 8) & 0xff) * factor);
  const b = Math.round((color & 0xff) * factor);
  return (r << 16) | (g << 8) | b;
};
