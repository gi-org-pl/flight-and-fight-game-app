import { useEffect, useRef, useState } from "react";
import QteResultDisplay from "../QteResultDisplay/QteResultDisplay";
import type { RecallQteProps } from "./RecallQte.types";

const TICK_MS = 100;
const RESULT_DISPLAY_MS = 1500;

const UNIQUE_SYMBOLS = ["↑", "→", "↓", "←"] as const;

const KEY_TO_SYMBOL: Record<string, string> = {
  ArrowUp: "↑",
  ArrowRight: "→",
  ArrowDown: "↓",
  ArrowLeft: "←",
};

type Phase = "memorize" | "input" | "result";

const RecallQte = ({ definition, onComplete }: RecallQteProps) => {
  const { params, title } = definition;
  const [phase, setPhase] = useState<Phase>("memorize");
  const [memorizeTimeLeft, setMemorizeTimeLeft] = useState(params.memorizeMs);
  const [inputTimeLeft, setInputTimeLeft] = useState(params.inputDurationMs);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState(0);
  const phaseRef = useRef<Phase>("memorize");
  phaseRef.current = phase;
  const progressRef = useRef(0);
  progressRef.current = progress;

  const [visibleCount, setVisibleCount] = useState(0);

  // Reveal symbols one by one during memorize phase
  useEffect(() => {
    if (phase !== "memorize") return;

    const revealInterval = Math.min(600, params.memorizeMs / (params.sequence.length + 1));
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= params.sequence.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, revealInterval);

    return () => clearInterval(interval);
  }, [phase, params.memorizeMs, params.sequence.length]);

  // Memorize countdown
  useEffect(() => {
    if (phase !== "memorize") return;

    const interval = setInterval(() => {
      setMemorizeTimeLeft((prev) => Math.max(0, prev - TICK_MS));
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "memorize" && memorizeTimeLeft <= 0) {
      setPhase("input");
    }
  }, [phase, memorizeTimeLeft]);

  // Input countdown
  useEffect(() => {
    if (phase !== "input") return;

    const interval = setInterval(() => {
      setInputTimeLeft((prev) => Math.max(0, prev - TICK_MS));
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "input" && inputTimeLeft <= 0) {
      const q = progressRef.current / params.sequence.length;
      setQuality(q);
      setPhase("result");
    }
  }, [phase, inputTimeLeft, params.sequence.length]);

  // Result display timer
  useEffect(() => {
    if (phase !== "result") return;

    const timeout = setTimeout(() => onComplete(quality), RESULT_DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [phase, quality, onComplete]);

  // Keyboard support during input phase
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const symbol = KEY_TO_SYMBOL[e.key];
      if (!symbol || phaseRef.current !== "input") return;
      e.preventDefault();
      handleSymbolPress(symbol);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSymbolPress = (symbol: string) => {
    if (phaseRef.current !== "input") return;

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
        {Math.round(quality * 100)}% recalled
      </QteResultDisplay>
    );
  }

  if (phase === "memorize") {
    const memorizeLeftSec = (memorizeTimeLeft / 1000).toFixed(1);
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <p className="text-white text-center">{title}</p>
        <p className="text-white">Memorize the sequence!</p>
        <div className="flex gap-4 justify-center">
          {params.sequence.map((symbol, index) => (
            <span
              key={`${symbol}-${index}`}
              className="text-3xl text-white transition-opacity duration-500"
              style={{ opacity: index < visibleCount ? 1 : 0 }}
            >
              {symbol}
            </span>
          ))}
        </div>
        <p className="text-white">{memorizeLeftSec}s to memorize</p>
      </div>
    );
  }

  const inputLeftSec = (inputTimeLeft / 1000).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <p className="text-white text-center">{title}</p>
      <p className="text-white">Reproduce the sequence from memory!</p>
      <div className="flex gap-4 justify-center">
        {params.sequence.map((_, index) => (
          <span
            key={index}
            className={`text-3xl ${index < progress ? "text-white/40" : index === progress ? "text-white" : "text-white/20"}`}
          >
            {index < progress ? params.sequence[index] : "?"}
          </span>
        ))}
      </div>
      <p className="text-white">{inputLeftSec}s left</p>
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

export default RecallQte;
