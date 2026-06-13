import { describe, expect, it } from "vitest";
import { toColorNumber } from "./toColorNumber";

describe("toColorNumber", () => {
  describe("when given a hex colour string", () => {
    it("converts it to the matching 0xRRGGBB integer", () => {
      expect(toColorNumber("#ffffff")).toBe(0xff_ff_ff);
    });

    it("preserves leading-zero channels", () => {
      expect(toColorNumber("#0000ff")).toBe(0x00_00_ff);
    });
  });
});
