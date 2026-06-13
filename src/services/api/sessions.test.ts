import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/services/api/client/apiClient";
import {
  createSession,
  getSession,
  joinSession,
} from "@/services/api/sessions";

const credentials = { sessionId: "s-1", playerId: "p-1" };
const characters = ["IRIS", "VEGA"] as const;

describe("createSession", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when the API returns valid credentials", () => {
    it("posts to /sessions with characters and returns the parsed credentials", async () => {
      const postSpy = vi
        .spyOn(apiClient, "post")
        .mockResolvedValue({ data: credentials });

      const result = await createSession([...characters]);

      expect(postSpy).toHaveBeenCalledWith("/sessions", { characters });
      expect(result).toEqual(credentials);
    });
  });

  describe("when the API returns an invalid shape", () => {
    it("throws a validation error", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValue({ data: { sessionId: 1 } });

      await expect(createSession([...characters])).rejects.toThrow(
        "API response validation failed",
      );
    });
  });
});

describe("joinSession", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when joining an open session", () => {
    it("posts to the join path with the code and characters", async () => {
      const postSpy = vi
        .spyOn(apiClient, "post")
        .mockResolvedValue({ data: credentials });

      const result = await joinSession("RRFFQ69G", [...characters]);

      expect(postSpy).toHaveBeenCalledWith("/sessions/RRFFQ69G/join", { characters });
      expect(result).toEqual(credentials);
    });
  });
});

describe("getSession", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when the session exists", () => {
    it("gets the session path and returns the parsed state", async () => {
      const session = {
        id: "s-1",
        state: "OPEN",
        firstPlayerId: "p-1",
        secondPlayerId: null,
        currentlyAttackingPlayerId: null,
      };
      const getSpy = vi
        .spyOn(apiClient, "get")
        .mockResolvedValue({ data: session });

      const result = await getSession("s-1");

      expect(getSpy).toHaveBeenCalledWith("/sessions/s-1");
      expect(result).toEqual(session);
    });
  });

  describe("when the API returns an invalid shape", () => {
    it("throws a validation error", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValue({ data: { id: "s-1" } });

      await expect(getSession("s-1")).rejects.toThrow(
        "API response validation failed",
      );
    });
  });
});
