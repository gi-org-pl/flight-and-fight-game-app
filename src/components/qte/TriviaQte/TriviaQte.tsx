import { useEffect, useState } from "react";
import QteResultDisplay from "../QteResultDisplay/QteResultDisplay";
import type { TriviaQteProps } from "./TriviaQte.types";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const TICK_MS = 100;
const RESULT_DISPLAY_MS = 1500;

const TriviaQte = ({ definition, onComplete }: TriviaQteProps) => {
  const { params, title } = definition;
  const [phase, setPhase] = useState<"active" | "result">("active");
  const [quality, setQuality] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(params.durationMs);

  useEffect(() => {
    if (phase !== "active") return;

    const interval = setInterval(() => {
      setTimeLeftMs((prev) => Math.max(0, prev - TICK_MS));
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "active" && timeLeftMs <= 0) {
      setQuality(0);
      setPhase("result");
    }
  }, [phase, timeLeftMs]);

  useEffect(() => {
    if (phase !== "result") return;

    const timeout = setTimeout(() => onComplete(quality), RESULT_DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [phase, quality, onComplete]);

  const handleSelect = (index: number) => {
    if (phase !== "active") return;

    const q = index === params.correctIndex ? 1 : 0;
    setQuality(q);
    setPhase("result");
  };

  if (phase === "result") {
    return (
      <QteResultDisplay quality={quality}>
        <p>{quality === 1 ? "Correct!" : "Wrong..."}</p>
        <p>{OPTION_LABELS[params.correctIndex]}. {params.options[params.correctIndex]}</p>
      </QteResultDisplay>
    );
  }

  const timeLeftSec = (timeLeftMs / 1000).toFixed(1);
  const timerPercent = Math.round((timeLeftMs / params.durationMs) * 100);

  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-white text-center">{title}</p>
      <p className="text-white text-center">{params.question}</p>
      <progress
        className="nes-progress is-warning w-full"
        value={timerPercent}
        max={100}
      />
      <p className="text-white text-center">{timeLeftSec}s</p>
      <div className="grid grid-cols-2 gap-2">
        {params.options.map((option, index) => (
          <button
            key={option}
            className="nes-btn"
            type="button"
            onClick={() => handleSelect(index)}
          >
            {OPTION_LABELS[index]}. {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TriviaQte;
