import GameContent from "@/components/Game/GameContent/GameContent";

const Index = () => {
  return (
    <div className="w-full h-lvh bg-color-blush flex items-center justify-center bg-blush">
      <div className="flex gap-4 flex-col">
        <div className="nes-container with-title is-dark is-centered">
          <GameContent />
        </div>
        <div className="title text-white">
          Fight or Flight | © Generacja Innowacja
        </div>
      </div>
    </div>
  );
};

export default Index;
