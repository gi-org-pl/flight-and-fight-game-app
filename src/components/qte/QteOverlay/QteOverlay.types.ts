import type { QteDefinition } from "@/types/qte";

export interface QteOverlayProps {
  definition: QteDefinition;
  onClose: (quality: number) => void;
}
