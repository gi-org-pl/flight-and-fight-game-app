import { io, type Socket } from "socket.io-client";
import type {
  AttackActionPayload,
  AttackedPayload,
  CharacterList,
  DefendActionPayload,
  Exception,
  Session,
} from "@/services/game/schemas/game";

export interface ServerToClientEvents {
  session: (payload: Session) => void;
  attacked: (payload: AttackedPayload) => void;
  charactersUpdated: (payload: CharacterList) => void;
  turnChanged: (payload: Session) => void;
  ready: (payload: Session) => void;
  exception: (payload: Exception) => void;
}

export interface ClientToServerEvents {
  attack: (payload: AttackActionPayload) => void;
  defend: (payload: DefendActionPayload) => void;
  selectCharacters: (payload: { characters: string[] }) => void;
}

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const DEFAULT_GAME_URL =
  import.meta.env.VITE_GAME_SOCKET_URL ?? "https://api-faf.gi.org.pl";

export const createGameSocket = (
  playerId: string,
  sessionId: string,
  url: string = DEFAULT_GAME_URL,
): GameSocket => {
  return io(`${url}/game`, {
    auth: { token: playerId, sessionId },
    autoConnect: false,
    transports: ["websocket"],
  });
};
