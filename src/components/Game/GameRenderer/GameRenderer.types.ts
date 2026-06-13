import type { GameService } from "@/services/game/gameService";

export type GameMode = "single" | "multiplayer";

export interface CharacterStats {
  intelligence: number;
  defense: number;
  power: number;
  health: number;
  refresh: number;
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
  gameService: GameService;
}

export interface StartSceneData {
  characters: GameCharacter[];
}

export interface ConnectSceneData {
  mode: GameMode;
  characters: GameCharacter[];
  /** When set (e.g. from a `?join_id=` deep link), auto-join this session. */
  autoJoinId?: string;
}

export interface CharacterSelectSceneData {
  mode: GameMode;
  characters: GameCharacter[];
  session?: SessionInfo;
}

export interface FightSceneData {
  mode: GameMode;
  characters: GameCharacter[];
  roster: string[];
  session?: SessionInfo;
}

export interface WinnerSceneData {
  winner: string;
}

/** Which team a fighter belongs to during a fight. */
export type FightSide = "player" | "enemy";

/**
 * A character instantiated for combat: the source character plus the mutable
 * health that ticks down as it takes hits. `health` reaching 0 means it is out
 * of the fight. Stats stay immutable — only `health` changes during a battle.
 */
export interface Fighter {
  id: string;
  name: string;
  stats: CharacterStats;
  maxHealth: number;
  health: number;
}
