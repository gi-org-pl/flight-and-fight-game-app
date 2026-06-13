import { describe, expect, it } from "vitest";
import { apiErrorResponseSchema } from "@/services/api/schemas/error";

describe("apiErrorResponseSchema", () => {
  describe("when given a structured error body", () => {
    it("parses it successfully", () => {
      const payload = {
        message: "Resource with given id does not exist.",
        error: "Not Found",
        statusCode: 404,
      };

      expect(apiErrorResponseSchema.parse(payload)).toEqual(payload);
    });
  });

  describe("when statusCode is not a number", () => {
    it("fails validation", () => {
      const result = apiErrorResponseSchema.safeParse({
        message: "nope",
        error: "Not Found",
        statusCode: "404",
      });

      expect(result.success).toBe(false);
    });
  });
});
