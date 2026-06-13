import { describe, expect, it } from "vitest";
import {
  getSessionResponseSchema,
  sessionCredentialsResponseSchema,
  sessionStateSchema,
} from "@/services/api/schemas/session";

describe("sessionStateSchema", () => {
  describe("when given a known state", () => {
    it("accepts OPEN and CLOSED", () => {
      expect(sessionStateSchema.parse("OPEN")).toBe("OPEN");
      expect(sessionStateSchema.parse("CLOSED")).toBe("CLOSED");
    });
  });

  describe("when given an unknown state", () => {
    it("fails validation", () => {
      expect(sessionStateSchema.safeParse("PENDING").success).toBe(false);
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
  describe("when the session is still open", () => {
    it("accepts null secondPlayerId and currentlyAttackingPlayerId", () => {
      const payload = {
        id: "s-1",
        state: "OPEN",
        firstPlayerId: "p-1",
        secondPlayerId: null,
        currentlyAttackingPlayerId: null,
      };

      expect(getSessionResponseSchema.parse(payload)).toEqual(payload);
    });
  });

  describe("when the session is closed", () => {
    it("accepts populated secondPlayerId and currentlyAttackingPlayerId", () => {
      const payload = {
        id: "s-1",
        state: "CLOSED",
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
