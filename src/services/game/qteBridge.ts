import type { QteDefinition } from "@/types/qte";

type QteResultCallback = (quality: number) => void;
type QteRequestHandler = (
  definition: QteDefinition,
  onResult: QteResultCallback,
) => void;

let activeHandler: QteRequestHandler | null = null;

export const qteBridge = {
  register(handler: QteRequestHandler): void {
    activeHandler = handler;
  },

  unregister(): void {
    activeHandler = null;
  },

  // Called from Phaser. Invokes the React handler if registered; falls back to
  // quality 0 (minimum multiplier) so the game never hangs without a handler.
  request(definition: QteDefinition, onResult: QteResultCallback): void {
    if (activeHandler) {
      activeHandler(definition, onResult);
    } else {
      onResult(0);
    }
  },
};
