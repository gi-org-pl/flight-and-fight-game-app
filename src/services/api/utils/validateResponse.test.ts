import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validateResponse } from "@/services/api/utils/validateResponse";

const schema = z.object({ id: z.string() });

describe("validateResponse", () => {
  describe("when the data matches the schema", () => {
    it("returns the parsed data", () => {
      expect(validateResponse(schema, { id: "abc" })).toEqual({ id: "abc" });
    });
  });

  describe("when the data does not match the schema", () => {
    it("throws a validation error", () => {
      expect(() => validateResponse(schema, { id: 1 })).toThrow(
        "API response validation failed",
      );
    });
  });
});
