import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TimingQteDefinition } from "@/types/qte";
import TimingQte from "./TimingQte";

// cursorSpeedPercent: 100 → cursor moves 10% per 100ms tick
// zone: center 50%, width 40% → 30%..70%
// After 500ms: cursor at ~50% (dead center) → quality 1
const definition: TimingQteDefinition = {
  id: "test-timing",
  type: "timing",
  role: "attacker",
  title: "Strike Zone",
  difficulty: 2,
  params: {
    zoneCenterPercent: 50,
    zoneWidthPercent: 40,
    cursorSpeedPercent: 100,
    durationMs: 3000,
  },
};

describe("<TimingQte />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe("when rendered", () => {
    it("shows the title and press button", () => {
      render(<TimingQte definition={definition} onComplete={vi.fn()} />);

      expect(screen.getByText("Strike Zone")).toBeDefined();
      expect(
        screen.getByRole("button", { name: /press timing button/i }),
      ).toBeDefined();
    });
  });

  describe("when pressed while cursor is inside the zone", () => {
    it("calls onComplete with quality above 0", () => {
      const onComplete = vi.fn();
      render(<TimingQte definition={definition} onComplete={onComplete} />);

      // advance 500ms → cursor at ~50% (zone center) → quality near 1
      act(() => {
        vi.advanceTimersByTime(500);
      });
      fireEvent.click(
        screen.getByRole("button", { name: /press timing button/i }),
      );
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
      const [q] = onComplete.mock.calls[0];
      expect(q).toBeGreaterThan(0);
    });
  });

  describe("when pressed while cursor is outside the zone", () => {
    it("calls onComplete with quality 0", () => {
      const onComplete = vi.fn();
      render(<TimingQte definition={definition} onComplete={onComplete} />);

      // cursor starts at 0 (far left, outside zone starting at 30%) — press immediately
      fireEvent.click(
        screen.getByRole("button", { name: /press timing button/i }),
      );
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(onComplete).toHaveBeenCalledWith(0);
    });
  });

  describe("when the timer expires without a press", () => {
    it("calls onComplete with quality 0", () => {
      const onComplete = vi.fn();
      render(<TimingQte definition={definition} onComplete={onComplete} />);

      act(() => {
        vi.advanceTimersByTime(3100);
      });
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(onComplete).toHaveBeenCalledWith(0);
    });
  });
});
