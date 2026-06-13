import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("when called repeatedly within the delay", () => {
    it("invokes the callback once with the latest args", () => {
      const callback = vi.fn();
      const debounced = debounce(callback, 200);

      debounced("a");
      debounced("b");
      vi.advanceTimersByTime(199);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("b");
    });
  });

  describe("when cancelled before the delay elapses", () => {
    it("never invokes the callback", () => {
      const callback = vi.fn();
      const debounced = debounce(callback, 200);

      debounced("a");
      debounced.cancel();
      vi.advanceTimersByTime(500);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
