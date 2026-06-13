import { io } from "socket.io-client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createGameSocket } from "./gameSocket";

vi.mock("socket.io-client", () => ({
  io: vi.fn().mockReturnValue({ id: "mock-socket" }),
}));

describe("createGameSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when called with playerId and sessionId", () => {
    it("calls io with the /game namespace and correct auth", () => {
      createGameSocket("player-1", "session-abc", "http://localhost:3000");

      expect(io).toHaveBeenCalledWith("http://localhost:3000/game", {
        auth: { token: "player-1", sessionId: "session-abc" },
        autoConnect: false,
      });
    });

    it("returns the socket instance from io", () => {
      const socket = createGameSocket("player-1", "session-abc");
      expect(socket).toEqual({ id: "mock-socket" });
    });
  });
});
