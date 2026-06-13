import { describe, expect, it } from "vitest";
import {
  attackedPayloadSchema,
  characterListSchema,
  characterSchema,
  exceptionSchema,
  sessionSchema,
} from "./game";

const validSession = {
  id: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  state: "OPEN" as const,
  firstPlayerId: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  secondPlayerId: null,
  currentlyAttackingPlayerId: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("sessionSchema", () => {
  describe("when given a valid session payload", () => {
    it("parses successfully", () => {
      expect(sessionSchema.parse(validSession)).toMatchObject(validSession);
    });
  });

  describe("when secondPlayerId is a string", () => {
    it("parses successfully", () => {
      const result = sessionSchema.parse({
        ...validSession,
        secondPlayerId: "01ARZ3NDEKTSV4RRFFQ69G5FAW",
      });
      expect(result.secondPlayerId).toBe("01ARZ3NDEKTSV4RRFFQ69G5FAW");
    });
  });

  describe("when state is invalid", () => {
    it("throws a ZodError", () => {
      expect(() =>
        sessionSchema.parse({ ...validSession, state: "UNKNOWN" }),
      ).toThrow();
    });
  });
});

describe("attackedPayloadSchema", () => {
  describe("when given a valid payload", () => {
    it("parses successfully", () => {
      const payload = { attackingPlayerId: "01ARZ3NDEKTSV4RRFFQ69G5FAV" };
      expect(attackedPayloadSchema.parse(payload)).toMatchObject(payload);
    });
  });

  describe("when attackingPlayerId is missing", () => {
    it("throws a ZodError", () => {
      expect(() => attackedPayloadSchema.parse({})).toThrow();
    });
  });
});

describe("characterSchema", () => {
  describe("when given a valid character", () => {
    it("parses successfully", () => {
      const character = {
        type: "IRIS" as const,
        stats: {
          intelligence: 5,
          defense: 3,
          power: 7,
          health: 100,
          refresh: 10,
        },
      };
      expect(characterSchema.parse(character)).toMatchObject(character);
    });
  });

  describe("when type is not in the enum", () => {
    it("throws a ZodError", () => {
      expect(() =>
        characterSchema.parse({
          type: "UNKNOWN",
          stats: {
            intelligence: 5,
            defense: 3,
            power: 7,
            health: 100,
            refresh: 10,
          },
        }),
      ).toThrow();
    });
  });
});

describe("characterListSchema", () => {
  describe("when given an empty array", () => {
    it("parses successfully", () => {
      expect(characterListSchema.parse([])).toEqual([]);
    });
  });
});

describe("exceptionSchema", () => {
  describe("when given a full exception payload", () => {
    it("parses successfully", () => {
      const exception = {
        status: "error",
        message: "It is not your turn to attack.",
        cause: { pattern: "attack" },
      };
      expect(exceptionSchema.parse(exception)).toMatchObject(exception);
    });
  });

  describe("when cause is absent", () => {
    it("parses successfully without cause", () => {
      const result = exceptionSchema.parse({
        status: "error",
        message: "Unauthorized",
      });
      expect(result.cause).toBeUndefined();
    });
  });
});
