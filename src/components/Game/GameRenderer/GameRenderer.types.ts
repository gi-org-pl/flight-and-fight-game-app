export type GameMode = "single" | "multiplayer";

export interface CharacterStats {
  power: number;
  speed: number;
  defense: number;
}

export interface GameCharacter {
  id: string;
  name: string;
  stats: CharacterStats;
}

/** Which side of the session this client holds once connected. */
export type SessionRole = "host" | "guest";

/** Credentials + role for an established multiplayer session. */
export interface SessionInfo {
  sessionId: string;
  playerId: string;
  role: SessionRole;
}

export interface ConnectSceneData {
  mode: GameMode;
  /** When set (e.g. from a `?join_id=` deep link), auto-join this session. */
  autoJoinId?: string;
}

export interface CharacterSelectSceneData {
  mode: GameMode;
  session?: SessionInfo;
}

export interface FightSceneData {
  mode: GameMode;
  roster: string[];
  session?: SessionInfo;
}

export interface WinnerSceneData {
  winner: string;
}
