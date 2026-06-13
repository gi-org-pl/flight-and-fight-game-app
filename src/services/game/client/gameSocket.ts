import { io, type Socket } from "socket.io-client";
import type {
  AttackedPayload,
  CharacterList,
  Exception,
  Session,
} from "@/services/game/schemas/game";

export interface ServerToClientEvents {
  session: (payload: Session) => void;
  attacked: (payload: AttackedPayload) => void;
  charactersUpdated: (payload: CharacterList) => void;
  turnChanged: (payload: Session) => void;
  exception: (payload: Exception) => void;
}

export interface ClientToServerEvents {
  attack: () => void;
  defend: () => void;
}

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const DEFAULT_GAME_URL =
  import.meta.env.VITE_GAME_SOCKET_URL ?? "http://localhost:3000";

export const createGameSocket = (
  playerId: string,
  sessionId: string,
  url: string = DEFAULT_GAME_URL,
): GameSocket => {
  return io(`${url}/game`, {
    auth: { token: playerId, sessionId },
    autoConnect: false,
  });
};
