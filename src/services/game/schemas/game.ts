import { z } from "zod";
import {
  type CharacterType,
  characterStatsResponseSchema,
  characterTypeSchema,
} from "@/services/api/schemas/character";

export const gameSessionStateSchema = z.string();

export type GameSessionState = string;

export const sessionSchema = z.object({
  id: z.string(),
  state: gameSessionStateSchema,
  firstPlayerId: z.string(),
  secondPlayerId: z.string().nullable(),
  currentlyAttackingPlayerId: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Session = z.infer<typeof sessionSchema>;

export const attackedPayloadSchema = z.object({
  attackingPlayerId: z.string(),
  attackingCharacter: characterTypeSchema.optional(),
  attackedCharacter: characterTypeSchema.optional(),
});

export type AttackedPayload = z.infer<typeof attackedPayloadSchema>;

// The QTE multiplier the server accepts is clamped to this inclusive range.
export const QTE_MULTIPLIER_MIN = 1;
export const QTE_MULTIPLIER_MAX = 2;

/**
 * Payload the attacking player sends with `attack`. Despite the AsyncAPI doc
 * describing an empty payload, the live server requires the attacker to name
 * both combatants and supply its quick-time multiplier (1–2).
 */
export interface AttackActionPayload {
  attackingCharacter: CharacterType;
  attackedCharacter: CharacterType;
  quickTimeEventMultiplier: number;
}

/**
 * Payload the defending player sends with `defend`. The server already knows
 * the pending attack's combatants, so it rejects character fields here and
 * only accepts the defender's quick-time multiplier (1–2).
 */
export interface DefendActionPayload {
  quickTimeEventMultiplier: number;
}

export const characterSchema = z.object({
  type: characterTypeSchema,
  superpower: z.string().optional(),
  stats: characterStatsResponseSchema,
  isDead: z.boolean().optional(),
});

export type Character = z.infer<typeof characterSchema>;

export const characterListSchema = z.array(characterSchema);

export type CharacterList = z.infer<typeof characterListSchema>;

export const playerRosterSchema = z.object({
  playerId: z.string(),
  characters: characterListSchema,
});

export type PlayerRoster = z.infer<typeof playerRosterSchema>;

export const playerRostersSchema = z.array(playerRosterSchema);

export type PlayerRosters = z.infer<typeof playerRostersSchema>;

export const characterDiedSchema = z.object({
  playerId: z.string(),
  character: characterTypeSchema,
});

export type CharacterDied = z.infer<typeof characterDiedSchema>;

export const gameFinishedSchema = z.object({
  winnerId: z.string(),
  loserId: z.string(),
});

export type GameFinished = z.infer<typeof gameFinishedSchema>;

export const exceptionSchema = z.object({
  status: z.string(),
  message: z.string(),
  cause: z
    .object({
      pattern: z.string(),
      data: z.unknown().optional(),
    })
    .optional(),
  violations: z.record(z.string(), z.array(z.string())).optional(),
});

export type Exception = z.infer<typeof exceptionSchema>;
