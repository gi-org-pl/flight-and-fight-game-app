import { describe, expect, it } from "vitest";
import {
  characterResponseSchema,
  characterStatsResponseSchema,
  characterTypeSchema,
  selectCharactersRequestSchema,
} from "@/services/api/schemas/character";

const validStats = {
  intelligence: 8,
  defense: 9,
  power: 10,
  health: 10,
  refresh: 5,
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
      expect(characterStatsResponseSchema.parse(validStats)).toEqual(validStats);
    });
  });

  describe("when a stat is missing", () => {
    it("fails validation", () => {
      const { health: _health, ...noHealth } = validStats;
      expect(characterStatsResponseSchema.safeParse(noHealth).success).toBe(false);
    });
  });
});

describe("characterResponseSchema", () => {
  describe("when given a valid character", () => {
    it("parses successfully", () => {
      const payload = { type: "IRIS", stats: validStats };
      expect(characterResponseSchema.parse(payload)).toEqual(payload);
    });
  });

  describe("when type is invalid", () => {
    it("fails validation", () => {
      expect(
        characterResponseSchema.safeParse({ type: "INVALID", stats: validStats }).success,
      ).toBe(false);
    });
  });
});

describe("selectCharactersRequestSchema", () => {
  describe("when given a valid characters array", () => {
    it("parses successfully", () => {
      const payload = { characters: ["IRIS", "SKYE"] };
      expect(selectCharactersRequestSchema.parse(payload)).toEqual(payload);
    });
  });

  describe("when an element is an invalid character type", () => {
    it("fails validation", () => {
      expect(
        selectCharactersRequestSchema.safeParse({ characters: ["IRIS", "NOPE"] }).success,
      ).toBe(false);
    });
  });
});
