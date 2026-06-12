import { z } from "zod";

/**
 * Session lifecycle state — `OPEN` while waiting for the second player,
 * `CLOSED` once both have joined.
 */
export const sessionStateSchema = z.enum(["OPEN", "CLOSED"]);

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
});

export type GetSessionResponse = z.infer<typeof getSessionResponseSchema>;
