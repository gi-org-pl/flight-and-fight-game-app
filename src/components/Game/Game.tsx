import { useEffect, useState } from "react";
import { qteBridge } from "@/services/game/qteBridge";
import type { QteDefinition } from "@/types/qte";
import QteOverlay from "../qte/QteOverlay/QteOverlay";
import GameBackground from "./GameBackground/GameBackground";
import GameRenderer from "./GameRenderer/GameRenderer";

interface ActiveQte {
  definition: QteDefinition;
  onResult: (quality: number) => void;
}

const Game = () => {
  const [activeQte, setActiveQte] = useState<ActiveQte | null>(null);

  useEffect(() => {
    qteBridge.register((definition, onResult) => {
      setActiveQte({ definition, onResult });
    });
    return () => qteBridge.unregister();
  }, []);

  return (
    <div className="w-full h-lvh bg-color-blush flex items-center justify-center bg-blush relative">
      <GameBackground />
      <div className="flex gap-4 flex-col">
        <div
          className="nes-container with-title is-dark is-centered"
          style={{ padding: 0, background: "transparent" }}
        >
          <GameRenderer />
        </div>
        <div className="flex justify-between items-center z-10">
          <div className="title text-white">
            Flight and Fight | © Generacja Innowacja
          </div>
        </div>
      </div>
      {activeQte && (
        <QteOverlay
          definition={activeQte.definition}
          onClose={(quality) => {
            activeQte.onResult(quality);
            setActiveQte(null);
          }}
        />
      )}
    </div>
  );
};

export default Game;
