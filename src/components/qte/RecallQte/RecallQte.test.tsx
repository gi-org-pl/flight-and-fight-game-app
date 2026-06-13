import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RecallQteDefinition } from "@/types/qte";
import RecallQte from "./RecallQte";

const definition: RecallQteDefinition = {
  id: "test-recall",
  type: "recall",
  role: "defender",
  title: "Pattern Memory",
  difficulty: 2,
  params: {
    sequence: ["↑", "→", "↓"],
    memorizeMs: 2000,
    inputDurationMs: 5000,
  },
};

const pressSymbol = (symbol: string) =>
  fireEvent.click(screen.getByRole("button", { name: `Press ${symbol}` }));

describe("<RecallQte />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe("during the memorize phase", () => {
    it("shows the sequence and a memorize countdown", () => {
      render(<RecallQte definition={definition} onComplete={vi.fn()} />);

      expect(screen.getByText("Memorize the sequence!")).toBeDefined();
      expect(screen.getAllByText("↑").length).toBeGreaterThan(0);
      expect(screen.getAllByText("→").length).toBeGreaterThan(0);
      expect(screen.getAllByText("↓").length).toBeGreaterThan(0);
    });

    it("does not show input buttons during memorize", () => {
      render(<RecallQte definition={definition} onComplete={vi.fn()} />);

      expect(
        screen.queryByRole("button", { name: /Press ↑/i }),
      ).toBeNull();
    });
  });

  describe("after the memorize phase ends", () => {
    it("hides the sequence and shows input buttons", () => {
      render(<RecallQte definition={definition} onComplete={vi.fn()} />);

      act(() => {
        vi.advanceTimersByTime(2100);
      });

      expect(screen.getByText("Reproduce the sequence from memory!")).toBeDefined();
      expect(screen.getByRole("button", { name: "Press ↑" })).toBeDefined();
    });
  });

  describe("when the correct sequence is entered from memory", () => {
    it("calls onComplete with quality 1", () => {
      const onComplete = vi.fn();
      render(<RecallQte definition={definition} onComplete={onComplete} />);

      act(() => { vi.advanceTimersByTime(2100); });

      pressSymbol("↑");
      pressSymbol("→");
      pressSymbol("↓");

      act(() => { vi.advanceTimersByTime(1500); });

      expect(onComplete).toHaveBeenCalledWith(1);
    });
  });

  describe("when a wrong symbol is entered", () => {
    it("calls onComplete with quality 0", () => {
      const onComplete = vi.fn();
      render(<RecallQte definition={definition} onComplete={onComplete} />);

      act(() => { vi.advanceTimersByTime(2100); });

      pressSymbol("↓");

      act(() => { vi.advanceTimersByTime(1500); });

      expect(onComplete).toHaveBeenCalledWith(0);
    });
  });

  describe("when the input timer expires", () => {
    it("calls onComplete with partial quality based on progress", () => {
      const onComplete = vi.fn();
      render(<RecallQte definition={definition} onComplete={onComplete} />);

      act(() => { vi.advanceTimersByTime(2100); });

      pressSymbol("↑");

      act(() => { vi.advanceTimersByTime(5100); });
      act(() => { vi.advanceTimersByTime(1500); });

      expect(onComplete).toHaveBeenCalledWith(1 / 3);
    });
  });
});
