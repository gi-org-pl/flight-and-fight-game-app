import { describe, expect, it } from "vitest";
import { wedgePositions } from "./wedgePositions";

describe("wedgePositions", () => {
  describe("when laying out a full five-fighter roster", () => {
    const slots = wedgePositions(5);

    it("returns one slot per fighter", () => {
      expect(slots).toHaveLength(5);
    });

    it("places the apex furthest toward the centre line", () => {
      const apexX = slots[0].x;
      const otherXs = slots.slice(1).map((slot) => slot.x);

      for (const x of otherXs) {
        expect(apexX).toBeGreaterThan(x);
      }
    });

    it("widens each receding row away from the apex", () => {
      const innerSpread = Math.abs(slots[1].y - slots[2].y);
      const outerSpread = Math.abs(slots[3].y - slots[4].y);

      expect(outerSpread).toBeGreaterThan(innerSpread);
      // ...and the outer pair sits further back than the inner pair.
      expect(slots[3].x).toBeLessThan(slots[1].x);
    });
  });

  describe("when the roster is smaller than the formation", () => {
    it("returns only the leading slots", () => {
      expect(wedgePositions(2)).toEqual([
        { x: 177, y: 145 },
        { x: 115, y: 105 },
      ]);
    });
  });

  describe("when the roster is empty", () => {
    it("returns no slots", () => {
      expect(wedgePositions(0)).toEqual([]);
    });
  });
});
