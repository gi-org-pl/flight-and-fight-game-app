import { z } from "zod";

/**
 * Structured error body returned by the API (generalised from
 * `GenericNotFoundResponse`). Used to normalise failed responses into a
 * predictable {@link ApiError} shape.
 */
export const apiErrorResponseSchema = z.object({
  message: z.string(),
  error: z.string(),
  statusCode: z.number(),
});

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
