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

export const superpowerSchema = z.enum([
  "LIGHT",
  "DARK",
  "WATER",
  "GRASS",
  "FIRE",
  "ELECTRIC",
  "GROUND",
  "AIR",
  "ICE",
]);

export type Superpower = z.infer<typeof superpowerSchema>;

export const characterStatsResponseSchema = z.object({
  intelligence: z.number(),
  defense: z.number(),
  power: z.number(),
  health: z.number(),
});

export type CharacterStatsResponse = z.infer<
  typeof characterStatsResponseSchema
>;

export const characterResponseSchema = z.object({
  type: characterTypeSchema,
  superpower: superpowerSchema,
  stats: characterStatsResponseSchema,
});

export type CharacterResponse = z.infer<typeof characterResponseSchema>;
