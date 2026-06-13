import type { TriviaQteDefinition } from "@/types/qte";

export interface TriviaQteProps {
  definition: TriviaQteDefinition;
  onComplete: (quality: number) => void;
}
