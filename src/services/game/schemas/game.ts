import { z } from "zod";
import {
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
});

export type AttackedPayload = z.infer<typeof attackedPayloadSchema>;

export const characterSchema = z.object({
  type: characterTypeSchema,
  stats: characterStatsResponseSchema,
});

export type Character = z.infer<typeof characterSchema>;

export const characterListSchema = z.array(characterSchema);

export type CharacterList = z.infer<typeof characterListSchema>;

export const exceptionSchema = z.object({
  status: z.string(),
  message: z.string(),
  cause: z
    .object({
      pattern: z.string(),
    })
    .optional(),
});

export type Exception = z.infer<typeof exceptionSchema>;
