import { z } from "zod";

/**
 * Session lifecycle state — `WAITING_FOR_SECOND_PLAYER` until an opponent joins,
 * `WAITING_FOR_CHARACTER_CHOICE` until both players pick their characters,
 * `READY` once the game can start.
 */
export const sessionStateSchema = z.enum([
  "WAITING_FOR_SECOND_PLAYER",
  "WAITING_FOR_CHARACTER_CHOICE",
  "READY",
]);

export type SessionState = z.infer<typeof sessionStateSchema>;

/**
 * Mirrors `SessionCredentialsResponse` — returned by `POST /sessions` and
 * `POST /sessions/{id}/join`.
 */
export const sessionCredentialsResponseSchema = z.object({
  sessionId: z.string(),
  playerId: z.string(),
});

export type SessionCredentialsResponse = z.infer<
  typeof sessionCredentialsResponseSchema
>;

/**
 * Mirrors `GetSessionResponse` — returned by `GET /sessions/{id}`.
 * `secondPlayerId` is null while the session is still `OPEN`.
 */
export const getSessionResponseSchema = z.object({
  id: z.string(),
  state: sessionStateSchema,
  firstPlayerId: z.string(),
  secondPlayerId: z.string().nullable(),
  currentlyAttackingPlayerId: z.string().nullable(),
});

export type GetSessionResponse = z.infer<typeof getSessionResponseSchema>;
