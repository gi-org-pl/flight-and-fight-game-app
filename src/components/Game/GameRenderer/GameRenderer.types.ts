export type GameMode = "single" | "multiplayer";

export interface GameCharacter {
  id: string;
  name: string;
}

export interface MatchmakingSceneData {
  mode: GameMode;
}

export interface CharacterSelectSceneData {
  mode: GameMode;
}

export interface FightSceneData {
  mode: GameMode;
  roster: string[];
}

export interface WinnerSceneData {
  winner: string;
}
