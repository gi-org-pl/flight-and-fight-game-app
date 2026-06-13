import { z } from "zod";

export const characterTypeSchema = z.enum([
  "IRIS",
  "ZEPHYR",
  "WENDY",
  "SKYE",
  "SUNNY",
  "AURA",
  "NEIL",
  "GALE",
  "THORA",
  "VEGA",
]);

export type CharacterType = z.infer<typeof characterTypeSchema>;

export const characterStatsResponseSchema = z.object({
  intelligence: z.number(),
  defense: z.number(),
  power: z.number(),
  health: z.number(),
  refresh: z.number(),
});

export type CharacterStatsResponse = z.infer<
  typeof characterStatsResponseSchema
>;

export const characterResponseSchema = z.object({
  type: characterTypeSchema,
  stats: characterStatsResponseSchema,
});

export type CharacterResponse = z.infer<typeof characterResponseSchema>;

export const selectCharactersRequestSchema = z.object({
  characters: z.array(characterTypeSchema),
});

export type SelectCharactersRequest = z.infer<
  typeof selectCharactersRequestSchema
>;
