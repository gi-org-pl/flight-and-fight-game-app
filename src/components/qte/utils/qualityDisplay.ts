export interface QualityDisplay {
  label: string;
  colorClass: string;
}

export const getQualityDisplay = (quality: number): QualityDisplay => {
  if (quality >= 0.8) return { label: "PERFECT!", colorClass: "text-green" };
  if (quality >= 0.5) return { label: "GOOD!", colorClass: "text-orange" };
  if (quality > 0) return { label: "WEAK...", colorClass: "text-orange" };
  return { label: "MISS!", colorClass: "text-red" };
};
