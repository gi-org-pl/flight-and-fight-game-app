import { afterEach, describe, expect, it } from "vitest";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "@/services/api/utils/authToken";

describe("authToken store", () => {
  afterEach(() => {
    clearAuthToken();
  });

  describe("when no token has been set", () => {
    it("returns null", () => {
      expect(getAuthToken()).toBeNull();
    });
  });

  describe("when a token is set", () => {
    it("returns the stored token", () => {
      setAuthToken("jwt-123");

      expect(getAuthToken()).toBe("jwt-123");
    });
  });

  describe("when the token is cleared", () => {
    it("returns null again", () => {
      setAuthToken("jwt-123");
      clearAuthToken();

      expect(getAuthToken()).toBeNull();
    });
  });

  describe("when set to null explicitly", () => {
    it("returns null", () => {
      setAuthToken("jwt-123");
      setAuthToken(null);

      expect(getAuthToken()).toBeNull();
    });
  });
});
