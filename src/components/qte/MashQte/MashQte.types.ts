import type { MashQteDefinition } from "@/types/qte";

export interface MashQteProps {
  definition: MashQteDefinition;
  onComplete: (quality: number) => void;
}
