import type { ZodType } from "zod";

/**
 * Validates a raw API payload against a Zod schema. Every response passes
 * through here so runtime shape is guaranteed before it reaches the app.
 *
 * @throws {Error} when the payload does not match the schema.
 */
export const validateResponse = <T>(schema: ZodType<T>, data: unknown): T => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new Error(`API response validation failed: ${result.error.message}`);
  }

  return result.data;
};
