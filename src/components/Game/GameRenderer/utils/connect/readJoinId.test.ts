import { describe, expect, it } from "vitest";
import { readJoinId } from "./readJoinId";

describe("readJoinId", () => {
  describe("when the search string has a join id", () => {
    it("returns the id", () => {
      expect(readJoinId("?join_id=abc123")).toBe("abc123");
    });
  });

  describe("when the join id is surrounded by whitespace", () => {
    it("returns the trimmed id", () => {
      expect(readJoinId("?join_id=%20abc123%20")).toBe("abc123");
    });
  });

  describe("when there is no join id", () => {
    it("returns null", () => {
      expect(readJoinId("?other=1")).toBeNull();
    });
  });

  describe("when the join id is empty", () => {
    it("returns null", () => {
      expect(readJoinId("?join_id=")).toBeNull();
    });
  });
});
