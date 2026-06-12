import { z } from "zod";

/**
 * Mirrors `GetStatusResponse` from the API OpenAPI document — the payload
 * returned by `GET /`.
 */
export const statusResponseSchema = z.object({
  status: z.string(),
  version: z.string(),
});

export type StatusResponse = z.infer<typeof statusResponseSchema>;
