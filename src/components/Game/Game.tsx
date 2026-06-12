import GameRenderer from "@/components/Game/GameRenderer/GameRenderer";
import GameBackground from "./GameBackground/GameBackground";

const Game = () => {
  return (
    <div className="w-full h-lvh bg-color-blush flex items-center justify-center bg-blush relative">
      <GameBackground />
      <div className="flex gap-4 flex-col">
        <div className="nes-container with-title is-dark is-centered">
          <GameRenderer className="w-[960px] h-[540px]" />
        </div>
        <div className="title text-white z-10">
          Fight or Flight | © Generacja Innowacja
        </div>
      </div>
    </div>
  );
};

export default Game;
