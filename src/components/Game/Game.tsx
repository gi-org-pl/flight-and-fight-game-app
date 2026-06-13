import { useState } from "react";
import { QTE_DEFINITIONS } from "@/constants/qte";
import type { QteDefinition } from "@/types/qte";
import QteOverlay from "../qte/QteOverlay/QteOverlay";
import GameBackground from "./GameBackground/GameBackground";
import GameRenderer from "./GameRenderer/GameRenderer";

const Game = () => {
  const [activeQte, setActiveQte] = useState<QteDefinition | null>(null);

  const handleRandomQte = () => {
    const index = Math.floor(Math.random() * QTE_DEFINITIONS.length);
    setActiveQte(QTE_DEFINITIONS[index]);
  };

  return (
    <div className="w-full h-lvh bg-color-blush flex items-center justify-center bg-blush relative">
      <GameBackground />
      <div className="flex gap-4 flex-col">
        <div className="nes-container with-title is-dark is-centered">
          <GameRenderer className="w-[960px] h-[540px]" />
        </div>
        <div className="flex justify-between items-center z-10">
          <div className="title text-white">
            Fight or Flight | © Generacja Innowacja
          </div>
          <button
            className="nes-btn is-primary"
            type="button"
            onClick={handleRandomQte}
          >
            Try QTE
          </button>
        </div>
      </div>
      {activeQte && (
        <QteOverlay definition={activeQte} onClose={() => setActiveQte(null)} />
      )}
    </div>
  );
};

export default Game;
