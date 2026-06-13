import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TriviaQteDefinition } from "@/types/qte";
import TriviaQte from "./TriviaQte";

const definition: TriviaQteDefinition = {
  id: "test-trivia",
  type: "trivia",
  role: "defender",
  title: "Test Knowledge",
  difficulty: 2,
  params: {
    question: "Which stat reduces damage?",
    options: ["Power", "Speed", "Defense", "Luck"],
    correctIndex: 2,
    durationMs: 8000,
  },
};

describe("<TriviaQte />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe("when rendered", () => {
    it("shows the title and question", () => {
      render(<TriviaQte definition={definition} onComplete={vi.fn()} />);

      expect(screen.getByText("Test Knowledge")).toBeDefined();
      expect(screen.getByText("Which stat reduces damage?")).toBeDefined();
    });

    it("renders all four answer options", () => {
      render(<TriviaQte definition={definition} onComplete={vi.fn()} />);

      expect(screen.getByText(/A\. Power/)).toBeDefined();
      expect(screen.getByText(/B\. Speed/)).toBeDefined();
      expect(screen.getByText(/C\. Defense/)).toBeDefined();
      expect(screen.getByText(/D\. Luck/)).toBeDefined();
    });
  });

  describe("when the correct answer is selected", () => {
    it("calls onComplete with quality 1", () => {
      const onComplete = vi.fn();
      render(<TriviaQte definition={definition} onComplete={onComplete} />);

      fireEvent.click(screen.getByText(/C\. Defense/));
      vi.advanceTimersByTime(1500);

      expect(onComplete).toHaveBeenCalledWith(1);
    });

    it("shows a PERFECT result screen", () => {
      render(<TriviaQte definition={definition} onComplete={vi.fn()} />);

      fireEvent.click(screen.getByText(/C\. Defense/));

      expect(screen.getByText("PERFECT!")).toBeDefined();
    });
  });

  describe("when a wrong answer is selected", () => {
    it("calls onComplete with quality 0", () => {
      const onComplete = vi.fn();
      render(<TriviaQte definition={definition} onComplete={onComplete} />);

      fireEvent.click(screen.getByText(/A\. Power/));
      vi.advanceTimersByTime(1500);

      expect(onComplete).toHaveBeenCalledWith(0);
    });

    it("shows the correct answer on the result screen", () => {
      render(<TriviaQte definition={definition} onComplete={vi.fn()} />);

      fireEvent.click(screen.getByText(/A\. Power/));

      expect(screen.getByText(/C\. Defense/)).toBeDefined();
    });
  });
});
