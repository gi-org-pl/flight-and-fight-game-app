import type { RecallQteDefinition } from "@/types/qte";

export interface RecallQteProps {
  definition: RecallQteDefinition;
  onComplete: (quality: number) => void;
}
