import { afterEach, describe, expect, it, vi } from "vitest";
import { getCharacters, getMyCharacters } from "@/services/api/characters";
import { apiClient } from "@/services/api/client/apiClient";

const character = {
  type: "VEGA",
  stats: { intelligence: 8, defense: 9, power: 10, health: 10, refresh: 5 },
};

describe("getCharacters", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when the API returns a valid list", () => {
    it("gets /characters and returns the parsed list", async () => {
      const getSpy = vi
        .spyOn(apiClient, "get")
        .mockResolvedValue({ data: [character] });

      const result = await getCharacters();

      expect(getSpy).toHaveBeenCalledWith("/characters");
      expect(result).toEqual([character]);
    });
  });

  describe("when the API returns an invalid shape", () => {
    it("throws a validation error", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValue({
        data: [{ type: "UNKNOWN" }],
      });

      await expect(getCharacters()).rejects.toThrow(
        "API response validation failed",
      );
    });
  });
});

describe("getMyCharacters", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when the API returns a valid list", () => {
    it("gets /my-characters and returns the parsed list", async () => {
      const getSpy = vi
        .spyOn(apiClient, "get")
        .mockResolvedValue({ data: [character] });

      const result = await getMyCharacters();

      expect(getSpy).toHaveBeenCalledWith("/my-characters");
      expect(result).toEqual([character]);
    });
  });
});
