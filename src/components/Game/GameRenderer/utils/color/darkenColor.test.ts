import { describe, expect, it } from "vitest";
import { darkenColor } from "./darkenColor";

describe("darkenColor", () => {
  describe("when given a colour", () => {
    it("scales each channel by the default factor", () => {
      // 0xffffff → round(255 * 0.55) = 140 (0x8c) per channel.
      expect(darkenColor(0xff_ff_ff)).toBe(0x8c_8c_8c);
    });

    it("scales each channel by a provided factor", () => {
      expect(darkenColor(0xff_ff_ff, 0.5)).toBe(0x80_80_80);
    });

    it("leaves black unchanged", () => {
      expect(darkenColor(0x00_00_00)).toBe(0x00_00_00);
    });
  });
});
