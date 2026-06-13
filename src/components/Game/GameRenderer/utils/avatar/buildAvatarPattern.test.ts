import { describe, expect, it } from "vitest";
import { AVATAR_GRID, buildAvatarPattern } from "./buildAvatarPattern";

describe("buildAvatarPattern", () => {
  describe("for any character id", () => {
    const pattern = buildAvatarPattern("c1");

    it("builds a square grid of the expected size", () => {
      expect(pattern.cells).toHaveLength(AVATAR_GRID);
      for (const row of pattern.cells) {
        expect(row).toHaveLength(AVATAR_GRID);
      }
    });

    it("is horizontally symmetric (mirrored face)", () => {
      for (const row of pattern.cells) {
        for (let column = 0; column < AVATAR_GRID; column += 1) {
          expect(row[column]).toBe(row[AVATAR_GRID - 1 - column]);
        }
      }
    });

    it("picks a palette colour for the foreground", () => {
      expect(pattern.foreground).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe("when called with the same id twice", () => {
    it("produces an identical pattern (deterministic)", () => {
      expect(buildAvatarPattern("c3")).toEqual(buildAvatarPattern("c3"));
    });
  });

  describe("when called with different ids", () => {
    it("can produce different patterns", () => {
      const a = JSON.stringify(buildAvatarPattern("c1"));
      const b = JSON.stringify(buildAvatarPattern("c10"));

      expect(a).not.toBe(b);
    });
  });
});
