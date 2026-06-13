import type { SequenceQteDefinition } from "@/types/qte";

export interface SequenceQteProps {
  definition: SequenceQteDefinition;
  onComplete: (quality: number) => void;
}
