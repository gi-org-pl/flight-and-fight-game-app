import clouds from "@/assets/images/background/clouds.png?url";
import shadows from "@/assets/images/background/shadows.png?url";

const GameBackground = () => {
  return (
    <div className="w-lvw h-lvh bg-lavender absolute top-0 left-0 overflow-hidden z-0">
      <div
        className="h-lvh w-lvw object-cover animate-bg-drift-sh bg-repeat-x z-0 absolute"
        style={{
          imageRendering: "crisp-edges",
          backgroundImage: `url(${shadows})`,
          backgroundSize: "auto 100%",
        }}
      />
      <div
        className="h-lvh w-lvw object-cover animate-bg-drift bg-repeat-x z-10 absolute"
        style={{
          imageRendering: "crisp-edges",
          backgroundImage: `url(${clouds})`,
          backgroundSize: "auto 100%",
        }}
      />
    </div>
  );
};

export default GameBackground;
