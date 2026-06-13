import { useEffect, useRef, useState } from "react";
import QteResultDisplay from "../QteResultDisplay/QteResultDisplay";
import type { MashQteProps } from "./MashQte.types";

const TICK_MS = 100;
const RESULT_DISPLAY_MS = 1500;

const MashQte = ({ definition, onComplete }: MashQteProps) => {
  const { params, title } = definition;
  const [presses, setPresses] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(params.durationMs);
  const [phase, setPhase] = useState<"active" | "result">("active");
  const [quality, setQuality] = useState(0);
  const pressesRef = useRef(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    if (phase !== "active") return;

    const interval = setInterval(() => {
      setTimeLeftMs((prev) => Math.max(0, prev - TICK_MS));
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "active" && timeLeftMs <= 0) {
      setPhase("result");
    }
  }, [phase, timeLeftMs]);

  useEffect(() => {
    if (phase !== "result") return;

    const q = Math.min(1, pressesRef.current / params.target);
    setQuality(q);
    const timeout = setTimeout(() => onComplete(q), RESULT_DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [phase, params.target, onComplete]);

  useEffect(() => {
    const handleKeyDown = () => {
      if (phaseRef.current !== "active") return;
      pressesRef.current += 1;
      setPresses((p) => p + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handlePress = () => {
    if (phase !== "active") return;
    pressesRef.current += 1;
    setPresses((p) => p + 1);
  };

  if (phase === "result") {
    return (
      <QteResultDisplay quality={quality}>
        {Math.round(quality * 100)}% power
      </QteResultDisplay>
    );
  }

  const progressPercent = Math.min(
    100,
    Math.round((presses / params.target) * 100),
  );
  const timeLeftSec = (timeLeftMs / 1000).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <p className="text-white text-center">{title}</p>
      <p className="text-white">Mash as fast as you can!</p>
      <progress
        className="nes-progress is-primary w-full"
        value={progressPercent}
        max={100}
      />
      <p className="text-white">
        {progressPercent}% &mdash; {timeLeftSec}s left
      </p>
      <button
        className="nes-btn is-primary"
        type="button"
        onClick={handlePress}
        aria-label="Mash button"
      >
        SMASH!
      </button>
    </div>
  );
};

export default MashQte;
