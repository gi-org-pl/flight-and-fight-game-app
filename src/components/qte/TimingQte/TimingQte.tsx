import { useEffect, useRef, useState } from "react";
import QteResultDisplay from "../QteResultDisplay/QteResultDisplay";
import type { TimingQteProps } from "./TimingQte.types";

const TIMER_TICK_MS = 100;
const RESULT_DISPLAY_MS = 1500;

const TimingQte = ({ definition, onComplete }: TimingQteProps) => {
  const { params, title } = definition;
  const [timeLeftMs, setTimeLeftMs] = useState(params.durationMs);
  const [phase, setPhase] = useState<"active" | "result">("active");
  const [quality, setQuality] = useState(0);
  const startTimeRef = useRef(Date.now());
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // One full back-and-forth cycle duration in seconds.
  // At speed=100%/s the cursor crosses the bar in 1s and returns in another 1s = 2s cycle.
  const cycleDurationSec = 200 / params.cursorSpeedPercent;

  const getCursorPos = (): number => {
    const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
    const speed = params.cursorSpeedPercent / 100;
    const cycle = (elapsedSec * speed) % 2;
    return cycle <= 1 ? cycle : 2 - cycle;
  };

  // Countdown timer — display only, does not affect quality calculation
  useEffect(() => {
    if (phase !== "active") return;

    const interval = setInterval(() => {
      setTimeLeftMs((prev) => Math.max(0, prev - TIMER_TICK_MS));
    }, TIMER_TICK_MS);

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

  useEffect(() => {
    const handleKeyDown = () => {
      if (phaseRef.current !== "active") return;
      resolveHit();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const resolveHit = () => {
    if (phaseRef.current !== "active") return;

    const pos = getCursorPos();
    const zoneCenter = params.zoneCenterPercent / 100;
    const zoneHalf = params.zoneWidthPercent / 100 / 2;
    const distance = Math.abs(pos - zoneCenter);
    const q =
      distance <= zoneHalf ? Math.max(0, 1 - distance / zoneHalf) : 0;

    setQuality(q);
    setPhase("result");
  };

  if (phase === "result") {
    return (
      <QteResultDisplay quality={quality}>
        {Math.round(quality * 100)}% precision
      </QteResultDisplay>
    );
  }

  const zoneLeft = params.zoneCenterPercent - params.zoneWidthPercent / 2;
  const timeLeftSec = (timeLeftMs / 1000).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <p className="text-white text-center">{title}</p>
      <p className="text-white">Press when the cursor hits the zone!</p>
      <div className="relative w-full h-6 bg-white/20 overflow-hidden">
        <div
          className="absolute top-0 h-full bg-lavender/70"
          style={{
            left: `${zoneLeft}%`,
            width: `${params.zoneWidthPercent}%`,
          }}
        />
        {/* Cursor is animated purely via CSS — position computed from Date.now() on press */}
        <div
          className="absolute top-0 h-full w-1 bg-white -translate-x-1/2"
          style={{
            animationName: "timing-cursor-bounce",
            animationDuration: `${cycleDurationSec}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
          data-testid="timing-cursor"
        />
      </div>
      <p className="text-white">{timeLeftSec}s left</p>
      <button
        className="nes-btn is-primary"
        type="button"
        onClick={resolveHit}
        aria-label="Press timing button"
      >
        PRESS!
      </button>
    </div>
  );
};

export default TimingQte;
