import type { ReactNode } from "react";
import { getQualityDisplay } from "../utils/qualityDisplay";

interface QteResultDisplayProps {
  quality: number;
  children: ReactNode;
}

const QteResultDisplay = ({ quality, children }: QteResultDisplayProps) => {
  const { label, colorClass } = getQualityDisplay(quality);
  const labelAnim =
    quality > 0 ? "animate-qte-result-pop" : "animate-qte-result-shake";

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <p className={`text-2xl ${colorClass} ${labelAnim}`}>{label}</p>
      <div className="animate-qte-fade-up text-white text-center">
        {children}
      </div>
    </div>
  );
};

export default QteResultDisplay;
