import { describe, expect, it } from "vitest";
import { getQualityDisplay } from "./qualityDisplay";

describe("getQualityDisplay", () => {
  describe("when quality is 0.8 or above", () => {
    it("returns PERFECT label", () => {
      expect(getQualityDisplay(1).label).toBe("PERFECT!");
      expect(getQualityDisplay(0.8).label).toBe("PERFECT!");
    });
  });

  describe("when quality is between 0.5 and 0.8", () => {
    it("returns GOOD label", () => {
      expect(getQualityDisplay(0.5).label).toBe("GOOD!");
      expect(getQualityDisplay(0.79).label).toBe("GOOD!");
    });
  });

  describe("when quality is between 0 and 0.5", () => {
    it("returns WEAK label", () => {
      expect(getQualityDisplay(0.1).label).toBe("WEAK...");
      expect(getQualityDisplay(0.49).label).toBe("WEAK...");
    });
  });

  describe("when quality is 0", () => {
    it("returns MISS label", () => {
      expect(getQualityDisplay(0).label).toBe("MISS!");
    });
  });
});
