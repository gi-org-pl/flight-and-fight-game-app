import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MashQteDefinition } from "@/types/qte";
import MashQte from "./MashQte";

const definition: MashQteDefinition = {
  id: "test-mash",
  type: "mash",
  role: "attacker",
  title: "Test Strike",
  params: { target: 10, durationMs: 2000 },
};

describe("<MashQte />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe("when rendered", () => {
    it("shows the title and mash button", () => {
      render(<MashQte definition={definition} onComplete={vi.fn()} />);

      expect(screen.getByText("Test Strike")).toBeDefined();
      expect(screen.getByRole("button", { name: /mash/i })).toBeDefined();
    });

    it("shows 0% progress initially", () => {
      render(<MashQte definition={definition} onComplete={vi.fn()} />);

      expect(screen.getByText(/0%/)).toBeDefined();
    });
  });

  describe("when the button is pressed", () => {
    it("increases the progress bar value", () => {
      render(<MashQte definition={definition} onComplete={vi.fn()} />);

      const button = screen.getByRole("button", { name: /mash/i });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(screen.getByText(/30%/)).toBeDefined();
    });
  });

  describe("when the timer expires", () => {
    it("shows the result screen", () => {
      render(<MashQte definition={definition} onComplete={vi.fn()} />);

      act(() => {
        vi.advanceTimersByTime(2100);
      });

      expect(screen.queryByRole("button", { name: /mash/i })).toBeNull();
    });

    it("calls onComplete with quality proportional to presses", () => {
      const onComplete = vi.fn();
      render(<MashQte definition={definition} onComplete={onComplete} />);

      const button = screen.getByRole("button", { name: /mash/i });
      for (let i = 0; i < 5; i++) fireEvent.click(button);

      act(() => {
        vi.advanceTimersByTime(2100);
      });
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(onComplete).toHaveBeenCalledWith(0.5);
    });

    it("caps quality at 1 when presses exceed the target", () => {
      const onComplete = vi.fn();
      render(<MashQte definition={definition} onComplete={onComplete} />);

      const button = screen.getByRole("button", { name: /mash/i });
      for (let i = 0; i < 20; i++) fireEvent.click(button);

      act(() => {
        vi.advanceTimersByTime(2100);
      });
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(onComplete).toHaveBeenCalledWith(1);
    });
  });

  describe("when the result screen is shown", () => {
    it("ignores further button presses", () => {
      render(<MashQte definition={definition} onComplete={vi.fn()} />);

      act(() => {
        vi.advanceTimersByTime(2100);
      });

      expect(screen.queryByRole("button", { name: /mash/i })).toBeNull();
    });
  });
});
