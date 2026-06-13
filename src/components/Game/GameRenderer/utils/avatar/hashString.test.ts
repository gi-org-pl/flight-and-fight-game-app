import { describe, expect, it } from "vitest";
import { hashString } from "./hashString";

describe("hashString", () => {
  describe("when hashing the same string twice", () => {
    it("returns the same value (deterministic)", () => {
      expect(hashString("Falcon")).toBe(hashString("Falcon"));
    });
  });

  describe("when hashing different strings", () => {
    it("returns different values", () => {
      expect(hashString("Falcon")).not.toBe(hashString("Viper"));
    });
  });

  describe("for any input", () => {
    it("returns a non-negative 32-bit integer", () => {
      const hash = hashString("c1");

      expect(Number.isInteger(hash)).toBe(true);
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(0xff_ff_ff_ff);
    });
  });
});
