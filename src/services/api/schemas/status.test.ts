import { describe, expect, it } from "vitest";
import { statusResponseSchema } from "@/services/api/schemas/status";

describe("statusResponseSchema", () => {
  describe("when given a valid status payload", () => {
    it("parses it successfully", () => {
      const payload = { status: "OK", version: "1.0.0" };

      expect(statusResponseSchema.parse(payload)).toEqual(payload);
    });
  });

  describe("when a required field is missing", () => {
    it("fails validation", () => {
      expect(statusResponseSchema.safeParse({ status: "OK" }).success).toBe(
        false,
      );
    });
  });

  describe("when a field has the wrong type", () => {
    it("fails validation", () => {
      const result = statusResponseSchema.safeParse({
        status: "OK",
        version: 1,
      });

      expect(result.success).toBe(false);
    });
  });
});
