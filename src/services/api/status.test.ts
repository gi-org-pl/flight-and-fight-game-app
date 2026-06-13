import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/services/api/client/apiClient";
import { getStatus } from "@/services/api/status";

describe("getStatus", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when the API returns a valid status", () => {
    it("requests the root path and returns the parsed status", async () => {
      const data = { status: "OK", version: "1.0.0" };
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({ data });

      const result = await getStatus();

      expect(getSpy).toHaveBeenCalledWith("/");
      expect(result).toEqual(data);
    });
  });

  describe("when the API returns an invalid shape", () => {
    it("throws a validation error", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValue({ data: { status: "OK" } });

      await expect(getStatus()).rejects.toThrow(
        "API response validation failed",
      );
    });
  });
});
