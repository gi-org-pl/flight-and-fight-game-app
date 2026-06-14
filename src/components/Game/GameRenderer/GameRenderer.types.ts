import type {
  CharacterResponse,
  CharacterStatsResponse,
  Superpower,
} from "@/services/api/schemas/character";
import type { GameService } from "@/services/game/gameService";

export type GameMode = "single" | "multiplayer";

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
  characters: CharacterResponse[];
}

export interface ConnectSceneData {
  mode: GameMode;
  characters: CharacterResponse[];
  /** When set (e.g. from a `?join_id=` deep link), auto-join this session. */
  autoJoinId?: string;
}

export interface CharacterSelectSceneData {
  mode: GameMode;
  characters: CharacterResponse[];
  session?: SessionInfo;
}

export interface FightSceneData {
  mode: GameMode;
  characters: CharacterResponse[];
  roster: string[];
  /** Opponent's roster in server-returned order; index 0 goes to the apex slot. Multiplayer only. */
  opponentRoster?: string[];
  session?: SessionInfo;
  /** currentlyAttackingPlayerId from the ready session; null means not yet decided. Multiplayer only. */
  attackingPlayerId?: string | null;
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
  superpower: Superpower;
  stats: CharacterStatsResponse;
  maxHealth: number;
  health: number;
  superpowerLastUsedRound: number;
}
