export interface QualityDisplay {
  label: string;
  colorClass: string;
}

export const getQualityDisplay = (quality: number): QualityDisplay => {
  if (quality >= 0.8) return { label: "PERFECT!", colorClass: "text-lavender" };
  if (quality >= 0.5) return { label: "GOOD!", colorClass: "text-orchid" };
  if (quality > 0) return { label: "WEAK...", colorClass: "text-rose" };
  return { label: "MISS!", colorClass: "text-rose" };
};
