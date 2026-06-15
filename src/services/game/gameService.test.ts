import type { GameSocket } from '@/services/game/client/gameSocket';
import * as gameSocketModule from '@/services/game/client/gameSocket';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createGameService } from './gameService';

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

const findWrapped = (
  mockOn: ReturnType<typeof vi.fn>,
  event: string,
): ((...args: unknown[]) => void) => {
  const call = (mockOn.mock.calls as unknown[][]).find(
    (c) => c[0] === event,
  ) as [string, (...args: unknown[]) => void] | undefined;
  if (!call) throw new Error(`No listener registered for "${event}"`);
  return call[1];
};

const validSession = {
  id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  state: 'OPEN' as const,
  firstPlayerId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  secondPlayerId: null,
  currentlyAttackingPlayerId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

let mockSocket: ReturnType<typeof makeMockSocket> & {
  _handlers: Record<string, ((...args: unknown[]) => void)[]>;
};

beforeEach(() => {
  mockSocket = makeMockSocket() as ReturnType<typeof makeMockSocket> & {
    _handlers: Record<string, ((...args: unknown[]) => void)[]>;
  };
  vi.spyOn(gameSocketModule, 'createGameSocket').mockReturnValue(mockSocket);
});

describe('createGameService', () => {
  describe('connect', () => {
    it('calls socket.connect', () => {
      const service = createGameService('p1', 's1');
      service.connect();
      expect(mockSocket.connect).toHaveBeenCalledOnce();
    });
  });

  describe('disconnect', () => {
    it('calls socket.disconnect', () => {
      const service = createGameService('p1', 's1');
      service.disconnect();
      expect(mockSocket.disconnect).toHaveBeenCalledOnce();
    });
  });

  describe('attack', () => {
    it('emits the attack event', () => {
      const payload = {
        attackingCharacter: 'IRIS' as const,
        attackedCharacter: 'ZEPHYR' as const,
        quickTimeEventMultiplier: 1,
      };
      const service = createGameService('p1', 's1');
      service.attack(payload);
      expect(mockSocket.emit).toHaveBeenCalledWith('attack', payload);
    });
  });

  describe('defend', () => {
    it('emits the defend event', () => {
      const payload = { quickTimeEventMultiplier: 1.5 };
      const service = createGameService('p1', 's1');
      service.defend(payload);
      expect(mockSocket.emit).toHaveBeenCalledWith('defend', payload);
    });
  });

  describe('selectCharacters', () => {
    it('emits the selectCharacters event with the given ids', () => {
      const service = createGameService('p1', 's1');
      service.selectCharacters(['c1', 'c2']);
      expect(mockSocket.emit).toHaveBeenCalledWith('selectCharacters', {
        characters: ['c1', 'c2'],
      });
    });
  });

  describe('onSession', () => {
    describe('when a valid session payload is received', () => {
      it('calls the handler with the parsed session', () => {
        const service = createGameService('p1', 's1');
        const handler = vi.fn();
        service.onSession(handler);
        findWrapped(
          mockSocket.on as ReturnType<typeof vi.fn>,
          'session',
        )(validSession);
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({ id: validSession.id }),
        );
      });
    });

    describe('when unsubscribe is called', () => {
      it('calls socket.off with the same handler', () => {
        const service = createGameService('p1', 's1');
        const unsubscribe = service.onSession(vi.fn());
        unsubscribe();
        expect(mockSocket.off).toHaveBeenCalledWith(
          'session',
          expect.any(Function),
        );
      });
    });
  });

  describe('onAttacked', () => {
    describe('when a payload with only attackingPlayerId is received', () => {
      it('calls the handler with the parsed payload', () => {
        const service = createGameService('p1', 's1');
        const handler = vi.fn();
        service.onAttacked(handler);
        findWrapped(
          mockSocket.on as ReturnType<typeof vi.fn>,
          'attacked',
        )({
          attackingPlayerId: 'p2',
        });
        expect(handler).toHaveBeenCalledWith({ attackingPlayerId: 'p2' });
      });
    });

    describe('when a payload with character types is received', () => {
      it('calls the handler with attacking and attacked characters', () => {
        const service = createGameService('p1', 's1');
        const handler = vi.fn();
        service.onAttacked(handler);
        findWrapped(
          mockSocket.on as ReturnType<typeof vi.fn>,
          'attacked',
        )({
          attackingPlayerId: 'p2',
          attackingCharacter: 'IRIS',
          attackedCharacter: 'ZEPHYR',
        });
        expect(handler).toHaveBeenCalledWith({
          attackingPlayerId: 'p2',
          attackingCharacter: 'IRIS',
          attackedCharacter: 'ZEPHYR',
        });
      });
    });
  });

  describe('onCharactersUpdated', () => {
    describe('when a player rosters payload is received', () => {
      it('calls the handler with the parsed rosters', () => {
        const service = createGameService('p1', 's1');
        const handler = vi.fn();
        service.onCharactersUpdated(handler);
        const rosters = [{ playerId: 'p1', characters: [] }];
        findWrapped(
          mockSocket.on as ReturnType<typeof vi.fn>,
          'charactersUpdated',
        )(rosters);
        expect(handler).toHaveBeenCalledWith(rosters);
      });
    });
  });

  describe('onCharacterDied', () => {
    describe('when a characterDied payload is received', () => {
      it('calls the handler with the parsed payload', () => {
        const service = createGameService('p1', 's1');
        const handler = vi.fn();
        service.onCharacterDied(handler);
        findWrapped(
          mockSocket.on as ReturnType<typeof vi.fn>,
          'characterDied',
        )({ playerId: 'p2', character: 'IRIS' });
        expect(handler).toHaveBeenCalledWith({
          playerId: 'p2',
          character: 'IRIS',
        });
      });
    });
  });

  describe('onGameFinished', () => {
    describe('when a gameFinished payload is received', () => {
      it('calls the handler with the parsed payload', () => {
        const service = createGameService('p1', 's1');
        const handler = vi.fn();
        service.onGameFinished(handler);
        findWrapped(
          mockSocket.on as ReturnType<typeof vi.fn>,
          'gameFinished',
        )({ winnerId: 'p1', loserId: 'p2' });
        expect(handler).toHaveBeenCalledWith({ winnerId: 'p1', loserId: 'p2' });
      });
    });
  });

  describe('onTurnChanged', () => {
    describe('when a valid session payload is received', () => {
      it('calls the handler with the parsed session', () => {
        const service = createGameService('p1', 's1');
        const handler = vi.fn();
        service.onTurnChanged(handler);
        findWrapped(
          mockSocket.on as ReturnType<typeof vi.fn>,
          'turnChanged',
        )(validSession);
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({ id: validSession.id }),
        );
      });
    });
  });

  describe('onReady', () => {
    describe('when a valid session payload is received', () => {
      it('calls the handler with the parsed session', () => {
        const service = createGameService('p1', 's1');
        const handler = vi.fn();
        service.onReady(handler);
        findWrapped(
          mockSocket.on as ReturnType<typeof vi.fn>,
          'ready',
        )({
          ...validSession,
          state: 'READY',
          currentlyAttackingPlayerId: 'p1',
        });
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({
            state: 'READY',
            currentlyAttackingPlayerId: 'p1',
          }),
        );
      });
    });

    describe('when unsubscribe is called', () => {
      it('calls socket.off with the same handler', () => {
        const service = createGameService('p1', 's1');
        const unsubscribe = service.onReady(vi.fn());
        unsubscribe();
        expect(mockSocket.off).toHaveBeenCalledWith(
          'ready',
          expect.any(Function),
        );
      });
    });
  });

  describe('onException', () => {
    describe('when a valid exception payload is received', () => {
      it('calls the handler with the parsed exception', () => {
        const service = createGameService('p1', 's1');
        const handler = vi.fn();
        service.onException(handler);
        findWrapped(
          mockSocket.on as ReturnType<typeof vi.fn>,
          'exception',
        )({
          status: 'error',
          message: 'Not your turn.',
        });
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'Not your turn.' }),
        );
      });
    });
  });

  describe('onConnect', () => {
    it('registers a connect listener and returns an unsubscribe function', () => {
      const service = createGameService('p1', 's1');
      const handler = vi.fn();
      const unsub = service.onConnect(handler);
      unsub();
      expect(mockSocket.off).toHaveBeenCalledWith('connect', handler);
    });
  });

  describe('onDisconnect', () => {
    it('registers a disconnect listener and returns an unsubscribe function', () => {
      const service = createGameService('p1', 's1');
      const handler = vi.fn();
      const unsub = service.onDisconnect(handler);
      unsub();
      expect(mockSocket.off).toHaveBeenCalledWith('disconnect', handler);
    });
  });
});
