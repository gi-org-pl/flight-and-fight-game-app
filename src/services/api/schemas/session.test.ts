import { describe, expect, it } from "vitest";
import {
  getSessionResponseSchema,
  sessionCredentialsResponseSchema,
  sessionStateSchema,
} from "@/services/api/schemas/session";

describe("sessionStateSchema", () => {
  describe("when given a known state", () => {
    it("accepts WAITING_FOR_SECOND_PLAYER, WAITING_FOR_CHARACTER_CHOICE, and READY", () => {
      expect(sessionStateSchema.parse("WAITING_FOR_SECOND_PLAYER")).toBe(
        "WAITING_FOR_SECOND_PLAYER",
      );
      expect(sessionStateSchema.parse("WAITING_FOR_CHARACTER_CHOICE")).toBe(
        "WAITING_FOR_CHARACTER_CHOICE",
      );
      expect(sessionStateSchema.parse("READY")).toBe("READY");
    });
  });

  describe("when given an unknown state", () => {
    it("fails validation", () => {
      expect(sessionStateSchema.safeParse("OPEN").success).toBe(false);
    });
  });
});

describe("sessionCredentialsResponseSchema", () => {
  describe("when given valid credentials", () => {
    it("parses them successfully", () => {
      const payload = { sessionId: "s-1", playerId: "p-1" };

      expect(sessionCredentialsResponseSchema.parse(payload)).toEqual(payload);
    });
  });

  describe("when playerId is missing", () => {
    it("fails validation", () => {
      const result = sessionCredentialsResponseSchema.safeParse({
        sessionId: "s-1",
      });

      expect(result.success).toBe(false);
    });
  });
});

describe("getSessionResponseSchema", () => {
  describe("when waiting for second player", () => {
    it("accepts null secondPlayerId and currentlyAttackingPlayerId", () => {
      const payload = {
        id: "s-1",
        state: "WAITING_FOR_SECOND_PLAYER",
        firstPlayerId: "p-1",
        secondPlayerId: null,
        currentlyAttackingPlayerId: null,
      };

      expect(getSessionResponseSchema.parse(payload)).toEqual(payload);
    });
  });

  describe("when waiting for character choice", () => {
    it("accepts populated secondPlayerId and null currentlyAttackingPlayerId", () => {
      const payload = {
        id: "s-1",
        state: "WAITING_FOR_CHARACTER_CHOICE",
        firstPlayerId: "p-1",
        secondPlayerId: "p-2",
        currentlyAttackingPlayerId: null,
      };

      expect(getSessionResponseSchema.parse(payload)).toEqual(payload);
    });
  });

  describe("when the game is ready", () => {
    it("accepts populated secondPlayerId and currentlyAttackingPlayerId", () => {
      const payload = {
        id: "s-1",
        state: "READY",
        firstPlayerId: "p-1",
        secondPlayerId: "p-2",
        currentlyAttackingPlayerId: "p-1",
      };

      expect(getSessionResponseSchema.parse(payload)).toEqual(payload);
    });
  });

  describe("when state is invalid", () => {
    it("fails validation", () => {
      const result = getSessionResponseSchema.safeParse({
        id: "s-1",
        state: "DONE",
        firstPlayerId: "p-1",
        secondPlayerId: null,
        currentlyAttackingPlayerId: null,
      });

      expect(result.success).toBe(false);
    });
  });
});
