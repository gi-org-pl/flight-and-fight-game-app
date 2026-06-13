import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SequenceQteDefinition } from "@/types/qte";
import SequenceQte from "./SequenceQte";

const definition: SequenceQteDefinition = {
  id: "test-sequence",
  type: "sequence",
  role: "defender",
  title: "Dodge Pattern",
  params: { sequence: ["↑", "→", "↓"], durationMs: 3000 },
};

const pressSymbol = (symbol: string) =>
  fireEvent.click(screen.getByRole("button", { name: `Press ${symbol}` }));

describe("<SequenceQte />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe("when rendered", () => {
    it("shows the title and all sequence symbols", () => {
      render(<SequenceQte definition={definition} onComplete={vi.fn()} />);

      expect(screen.getByText("Dodge Pattern")).toBeDefined();
      expect(screen.getAllByText("↑").length).toBeGreaterThan(0);
      expect(screen.getAllByText("→").length).toBeGreaterThan(0);
      expect(screen.getAllByText("↓").length).toBeGreaterThan(0);
    });
  });

  describe("when the correct sequence is entered", () => {
    it("calls onComplete with quality 1", () => {
      const onComplete = vi.fn();
      render(<SequenceQte definition={definition} onComplete={onComplete} />);

      pressSymbol("↑");
      pressSymbol("→");
      pressSymbol("↓");
      act(() => { vi.advanceTimersByTime(1500); });

      expect(onComplete).toHaveBeenCalledWith(1);
    });

    it("shows PERFECT on the result screen", () => {
      render(<SequenceQte definition={definition} onComplete={vi.fn()} />);

      pressSymbol("↑");
      pressSymbol("→");
      pressSymbol("↓");

      expect(screen.getByText("PERFECT!")).toBeDefined();
    });
  });

  describe("when a wrong symbol is pressed", () => {
    it("calls onComplete with quality 0", () => {
      const onComplete = vi.fn();
      render(<SequenceQte definition={definition} onComplete={onComplete} />);

      pressSymbol("↓");
      act(() => { vi.advanceTimersByTime(1500); });

      expect(onComplete).toHaveBeenCalledWith(0);
    });

    it("shows MISS on the result screen", () => {
      render(<SequenceQte definition={definition} onComplete={vi.fn()} />);

      pressSymbol("↓");

      expect(screen.getByText("MISS!")).toBeDefined();
    });
  });

  describe("when the timer expires mid-sequence", () => {
    it("calls onComplete with partial quality", () => {
      const onComplete = vi.fn();
      render(<SequenceQte definition={definition} onComplete={onComplete} />);

      pressSymbol("↑");

      act(() => { vi.advanceTimersByTime(3100); });
      act(() => { vi.advanceTimersByTime(1500); });

      expect(onComplete).toHaveBeenCalledWith(1 / 3);
    });
  });

  describe("when the timer expires with no presses", () => {
    it("calls onComplete with quality 0", () => {
      const onComplete = vi.fn();
      render(<SequenceQte definition={definition} onComplete={onComplete} />);

      act(() => { vi.advanceTimersByTime(3100); });
      act(() => { vi.advanceTimersByTime(1500); });

      expect(onComplete).toHaveBeenCalledWith(0);
    });
  });
});
