import { describe, expect, it } from "vitest";
import { ApiError } from "@/services/api/utils/apiError";

describe("ApiError", () => {
  describe("when constructed with full params", () => {
    it("exposes the normalised fields", () => {
      const cause = new Error("root");
      const apiError = new ApiError({
        message: "Not Found",
        statusCode: 404,
        error: "Not Found",
        cause,
      });

      expect(apiError).toBeInstanceOf(Error);
      expect(apiError.name).toBe("ApiError");
      expect(apiError.message).toBe("Not Found");
      expect(apiError.statusCode).toBe(404);
      expect(apiError.error).toBe("Not Found");
      expect(apiError.cause).toBe(cause);
    });
  });

  describe("when constructed with only required params", () => {
    it("leaves the optional error undefined", () => {
      const apiError = new ApiError({ message: "boom", statusCode: 500 });

      expect(apiError.error).toBeUndefined();
    });
  });
});
