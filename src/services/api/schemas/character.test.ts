import { describe, expect, it } from "vitest";
import {
  characterResponseSchema,
  characterStatsResponseSchema,
  characterTypeSchema,
} from "@/services/api/schemas/character";

const validStats = {
  intelligence: 8,
  defense: 9,
  power: 10,
  health: 10,
};

describe("characterTypeSchema", () => {
  describe("when given a known character type", () => {
    it("parses successfully", () => {
      expect(characterTypeSchema.parse("VEGA")).toBe("VEGA");
    });
  });

  describe("when given an unknown type", () => {
    it("fails validation", () => {
      expect(characterTypeSchema.safeParse("UNKNOWN").success).toBe(false);
    });
  });
});

describe("characterStatsResponseSchema", () => {
  describe("when given valid stats", () => {
    it("parses successfully", () => {
      expect(characterStatsResponseSchema.parse(validStats)).toEqual(
        validStats,
      );
    });
  });

  describe("when a stat is missing", () => {
    it("fails validation", () => {
      const { health: _health, ...noHealth } = validStats;
      expect(characterStatsResponseSchema.safeParse(noHealth).success).toBe(
        false,
      );
    });
  });
});

describe("characterResponseSchema", () => {
  describe("when given a valid character", () => {
    it("parses successfully", () => {
      const payload = { type: "IRIS", superpower: "GRASS", stats: validStats };
      expect(characterResponseSchema.parse(payload)).toEqual(payload);
    });
  });

  describe("when type is invalid", () => {
    it("fails validation", () => {
      expect(
        characterResponseSchema.safeParse({
          type: "INVALID",
          superpower: "GRASS",
          stats: validStats,
        }).success,
      ).toBe(false);
    });
  });

  describe("when superpower is invalid", () => {
    it("fails validation", () => {
      expect(
        characterResponseSchema.safeParse({
          type: "IRIS",
          superpower: "UNKNOWN",
          stats: validStats,
        }).success,
      ).toBe(false);
    });
  });
});
