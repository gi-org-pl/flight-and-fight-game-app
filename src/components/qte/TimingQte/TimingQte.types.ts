import type { TimingQteDefinition } from "@/types/qte";

export interface TimingQteProps {
  definition: TimingQteDefinition;
  onComplete: (quality: number) => void;
}
