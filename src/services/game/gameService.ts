import {
  createGameSocket,
  type GameSocket,
} from "@/services/game/client/gameSocket";
import {
  type AttackedPayload,
  attackedPayloadSchema,
  type CharacterList,
  characterListSchema,
  type Exception,
  exceptionSchema,
  type Session,
  sessionSchema,
} from "@/services/game/schemas/game";

export interface GameService {
  connect: () => void;
  disconnect: () => void;
  attack: () => void;
  defend: () => void;
  selectCharacters: (characterIds: string[]) => void;
  onSession: (handler: (session: Session) => void) => () => void;
  onAttacked: (handler: (payload: AttackedPayload) => void) => () => void;
  onCharactersUpdated: (
    handler: (characters: CharacterList) => void,
  ) => () => void;
  onTurnChanged: (handler: (session: Session) => void) => () => void;
  onException: (handler: (error: Exception) => void) => () => void;
  onConnect: (handler: () => void) => () => void;
  onDisconnect: (handler: (reason: string) => void) => () => void;
}

const makeUnsubscribe =
  (socket: GameSocket, event: string, handler: (...args: unknown[]) => void) =>
  () => {
    socket.off(event, handler);
  };

export const createGameService = (
  playerId: string,
  sessionId: string,
  url?: string,
): GameService => {
  const socket = createGameSocket(playerId, sessionId, url as string);

  return {
    connect: () => socket.connect(),
    disconnect: () => socket.disconnect(),
    attack: () => socket.emit("attack"),
    defend: () => socket.emit("defend"),
    selectCharacters: (characterIds) => socket.emit("selectCharacters", characterIds),

    onSession: (handler) => {
      const wrapped = (raw: unknown) => handler(sessionSchema.parse(raw));
      socket.on("session", wrapped as (payload: Session) => void);
      return makeUnsubscribe(
        socket,
        "session",
        wrapped as (...args: unknown[]) => void,
      );
    },

    onAttacked: (handler) => {
      const wrapped = (raw: unknown) =>
        handler(attackedPayloadSchema.parse(raw));
      socket.on("attacked", wrapped as (payload: AttackedPayload) => void);
      return makeUnsubscribe(
        socket,
        "attacked",
        wrapped as (...args: unknown[]) => void,
      );
    },

    onCharactersUpdated: (handler) => {
      const wrapped = (raw: unknown) => handler(characterListSchema.parse(raw));
      socket.on(
        "charactersUpdated",
        wrapped as (payload: CharacterList) => void,
      );
      return makeUnsubscribe(
        socket,
        "charactersUpdated",
        wrapped as (...args: unknown[]) => void,
      );
    },

    onTurnChanged: (handler) => {
      const wrapped = (raw: unknown) => handler(sessionSchema.parse(raw));
      socket.on("turnChanged", wrapped as (payload: Session) => void);
      return makeUnsubscribe(
        socket,
        "turnChanged",
        wrapped as (...args: unknown[]) => void,
      );
    },

    onException: (handler) => {
      const wrapped = (raw: unknown) => handler(exceptionSchema.parse(raw));
      socket.on("exception", wrapped as (payload: Exception) => void);
      return makeUnsubscribe(
        socket,
        "exception",
        wrapped as (...args: unknown[]) => void,
      );
    },

    onConnect: (handler) => {
      socket.on("connect", handler);
      return () => socket.off("connect", handler);
    },

    onDisconnect: (handler) => {
      socket.on("disconnect", handler);
      return () => socket.off("disconnect", handler);
    },
  };
};
