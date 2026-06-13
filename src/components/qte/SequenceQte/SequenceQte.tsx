import { useEffect, useRef, useState } from "react";
import QteResultDisplay from "../QteResultDisplay/QteResultDisplay";
import type { SequenceQteProps } from "./SequenceQte.types";

const TICK_MS = 100;
const RESULT_DISPLAY_MS = 1500;

const UNIQUE_SYMBOLS = ["↑", "→", "↓", "←"] as const;

const KEY_TO_SYMBOL: Record<string, string> = {
  ArrowUp: "↑",
  ArrowRight: "→",
  ArrowDown: "↓",
  ArrowLeft: "←",
};

const SequenceQte = ({ definition, onComplete }: SequenceQteProps) => {
  const { params, title } = definition;
  const [progress, setProgress] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(params.durationMs);
  const [phase, setPhase] = useState<"active" | "result">("active");
  const [quality, setQuality] = useState(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    if (phase !== "active") return;

    const interval = setInterval(() => {
      setTimeLeftMs((prev) => Math.max(0, prev - TICK_MS));
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "active" && timeLeftMs <= 0) {
      const q = progress / params.sequence.length;
      setQuality(q);
      setPhase("result");
    }
  }, [phase, timeLeftMs, progress, params.sequence.length]);

  useEffect(() => {
    if (phase !== "result") return;

    const timeout = setTimeout(() => onComplete(quality), RESULT_DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [phase, quality, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const symbol = KEY_TO_SYMBOL[e.key];
      if (!symbol || phaseRef.current !== "active") return;
      e.preventDefault();
      handleSymbolPress(symbol);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSymbolPress = (symbol: string) => {
    if (phaseRef.current !== "active") return;

    if (symbol === params.sequence[progressRef.current]) {
      const newProgress = progressRef.current + 1;
      if (newProgress === params.sequence.length) {
        setQuality(1);
        setPhase("result");
      } else {
        setProgress(newProgress);
      }
    } else {
      setQuality(0);
      setPhase("result");
    }
  };

  if (phase === "result") {
    return (
      <QteResultDisplay quality={quality}>
        {Math.round(quality * 100)}% complete
      </QteResultDisplay>
    );
  }

  const timeLeftSec = (timeLeftMs / 1000).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <p className="text-white text-center">{title}</p>
      <div className="flex gap-2 justify-center">
        {params.sequence.map((symbol, index) => (
          <span
            key={`${symbol}-${index}`}
            className={`text-2xl ${index < progress ? "text-white/40" : index === progress ? "text-white" : "text-white/60"}`}
          >
            {symbol}
          </span>
        ))}
      </div>
      <p className="text-white">{timeLeftSec}s left</p>
      <div className="flex gap-2 flex-wrap justify-center">
        {UNIQUE_SYMBOLS.map((symbol) => (
          <button
            key={symbol}
            className="nes-btn"
            type="button"
            onClick={() => handleSymbolPress(symbol)}
            aria-label={`Press ${symbol}`}
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SequenceQte;
