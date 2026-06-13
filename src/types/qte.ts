export type QteType = "mash" | "trivia" | "sequence" | "timing" | "recall";
export type QteRole = "attacker" | "defender";
export type QteDifficulty = 1 | 2 | 3 | 4 | 5;

interface BaseQteDefinition {
  id: string;
  type: QteType;
  role: QteRole;
  title: string;
  difficulty: QteDifficulty;
}

export interface MashQteParams {
  target: number;
  durationMs: number;
}

export interface MashQteDefinition extends BaseQteDefinition {
  type: "mash";
  params: MashQteParams;
}

export interface TriviaQteParams {
  question: string;
  options: readonly string[];
  correctIndex: number;
  durationMs: number;
}

export interface TriviaQteDefinition extends BaseQteDefinition {
  type: "trivia";
  params: TriviaQteParams;
}

export interface SequenceQteParams {
  sequence: readonly string[];
  durationMs: number;
}

export interface SequenceQteDefinition extends BaseQteDefinition {
  type: "sequence";
  params: SequenceQteParams;
}

// A cursor bounces across a bar. Press when it's inside the highlighted zone.
// Quality = 1 at zone center, falling off linearly to 0 at zone edges.
// Pressing outside the zone gives quality 0.
export interface TimingQteParams {
  zoneCenterPercent: number; // 0–100: where the sweet spot center sits on the bar
  zoneWidthPercent: number; // 0–100: width of the sweet spot
  cursorSpeedPercent: number; // percent of bar width traversed per second
  durationMs: number;
}

export interface TimingQteDefinition extends BaseQteDefinition {
  type: "timing";
  params: TimingQteParams;
}

// Show a sequence briefly, then hide it. Player must reproduce it from memory.
export interface RecallQteParams {
  sequence: readonly string[];
  memorizeMs: number; // how long the sequence is visible
  inputDurationMs: number; // time limit to reproduce it after memorize phase
}

export interface RecallQteDefinition extends BaseQteDefinition {
  type: "recall";
  params: RecallQteParams;
}

export type QteDefinition =
  | MashQteDefinition
  | TriviaQteDefinition
  | SequenceQteDefinition
  | TimingQteDefinition
  | RecallQteDefinition;
