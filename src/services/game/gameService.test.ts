import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameSocket } from "@/services/game/client/gameSocket";
import * as gameSocketModule from "@/services/game/client/gameSocket";
import { createGameService } from "./gameService";

const makeMockSocket = (): GameSocket => {
  const handlers: Record<string, ((...args: unknown[]) => void)[]> = {};
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers[event] = [...(handlers[event] ?? []), handler];
    }),
    off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers[event] = (handlers[event] ?? []).filter((h) => h !== handler);
    }),
    _handlers: handlers,
  } as unknown as GameSocket & {
    _handlers: Record<string, ((...args: unknown[]) => void)[]>;
  };
};

const validSession = {
  id: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  state: "OPEN" as const,
  firstPlayerId: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  secondPlayerId: null,
  currentlyAttackingPlayerId: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

let mockSocket: ReturnType<typeof makeMockSocket> & {
  _handlers: Record<string, ((...args: unknown[]) => void)[]>;
};

beforeEach(() => {
  mockSocket = makeMockSocket() as ReturnType<typeof makeMockSocket> & {
    _handlers: Record<string, ((...args: unknown[]) => void)[]>;
  };
  vi.spyOn(gameSocketModule, "createGameSocket").mockReturnValue(mockSocket);
});

describe("createGameService", () => {
  describe("connect", () => {
    it("calls socket.connect", () => {
      const service = createGameService("p1", "s1");
      service.connect();
      expect(mockSocket.connect).toHaveBeenCalledOnce();
    });
  });

  describe("disconnect", () => {
    it("calls socket.disconnect", () => {
      const service = createGameService("p1", "s1");
      service.disconnect();
      expect(mockSocket.disconnect).toHaveBeenCalledOnce();
    });
  });

  describe("attack", () => {
    it("emits the attack event", () => {
      const service = createGameService("p1", "s1");
      service.attack();
      expect(mockSocket.emit).toHaveBeenCalledWith("attack");
    });
  });

  describe("defend", () => {
    it("emits the defend event", () => {
      const service = createGameService("p1", "s1");
      service.defend();
      expect(mockSocket.emit).toHaveBeenCalledWith("defend");
    });
  });

  describe("onSession", () => {
    describe("when a valid session payload is received", () => {
      it("calls the handler with the parsed session", () => {
        const service = createGameService("p1", "s1");
        const handler = vi.fn();
        service.onSession(handler);
        const [, wrapped] = (
          mockSocket.on as ReturnType<typeof vi.fn>
        ).mock.calls.find(([e]: [string]) => e === "session") as [
          string,
          (...args: unknown[]) => void,
        ];
        wrapped(validSession);
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({ id: validSession.id }),
        );
      });
    });

    describe("when unsubscribe is called", () => {
      it("calls socket.off with the same handler", () => {
        const service = createGameService("p1", "s1");
        const unsubscribe = service.onSession(vi.fn());
        unsubscribe();
        expect(mockSocket.off).toHaveBeenCalledWith(
          "session",
          expect.any(Function),
        );
      });
    });
  });

  describe("onAttacked", () => {
    describe("when a valid attacked payload is received", () => {
      it("calls the handler with the parsed payload", () => {
        const service = createGameService("p1", "s1");
        const handler = vi.fn();
        service.onAttacked(handler);
        const [, wrapped] = (
          mockSocket.on as ReturnType<typeof vi.fn>
        ).mock.calls.find(([e]: [string]) => e === "attacked") as [
          string,
          (...args: unknown[]) => void,
        ];
        wrapped({ attackingPlayerId: "p2" });
        expect(handler).toHaveBeenCalledWith({ attackingPlayerId: "p2" });
      });
    });
  });

  describe("onCharactersUpdated", () => {
    describe("when an empty character list is received", () => {
      it("calls the handler with an empty array", () => {
        const service = createGameService("p1", "s1");
        const handler = vi.fn();
        service.onCharactersUpdated(handler);
        const [, wrapped] = (
          mockSocket.on as ReturnType<typeof vi.fn>
        ).mock.calls.find(([e]: [string]) => e === "charactersUpdated") as [
          string,
          (...args: unknown[]) => void,
        ];
        wrapped([]);
        expect(handler).toHaveBeenCalledWith([]);
      });
    });
  });

  describe("onTurnChanged", () => {
    describe("when a valid session payload is received", () => {
      it("calls the handler with the parsed session", () => {
        const service = createGameService("p1", "s1");
        const handler = vi.fn();
        service.onTurnChanged(handler);
        const [, wrapped] = (
          mockSocket.on as ReturnType<typeof vi.fn>
        ).mock.calls.find(([e]: [string]) => e === "turnChanged") as [
          string,
          (...args: unknown[]) => void,
        ];
        wrapped(validSession);
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({ id: validSession.id }),
        );
      });
    });
  });

  describe("onException", () => {
    describe("when a valid exception payload is received", () => {
      it("calls the handler with the parsed exception", () => {
        const service = createGameService("p1", "s1");
        const handler = vi.fn();
        service.onException(handler);
        const [, wrapped] = (
          mockSocket.on as ReturnType<typeof vi.fn>
        ).mock.calls.find(([e]: [string]) => e === "exception") as [
          string,
          (...args: unknown[]) => void,
        ];
        wrapped({ status: "error", message: "Not your turn." });
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({ message: "Not your turn." }),
        );
      });
    });
  });

  describe("onConnect", () => {
    it("registers a connect listener and returns an unsubscribe function", () => {
      const service = createGameService("p1", "s1");
      const handler = vi.fn();
      const unsub = service.onConnect(handler);
      unsub();
      expect(mockSocket.off).toHaveBeenCalledWith("connect", handler);
    });
  });

  describe("onDisconnect", () => {
    it("registers a disconnect listener and returns an unsubscribe function", () => {
      const service = createGameService("p1", "s1");
      const handler = vi.fn();
      const unsub = service.onDisconnect(handler);
      unsub();
      expect(mockSocket.off).toHaveBeenCalledWith("disconnect", handler);
    });
  });
});
