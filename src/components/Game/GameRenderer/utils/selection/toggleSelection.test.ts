import { describe, expect, it } from "vitest";
import { toggleSelection } from "./toggleSelection";

describe("toggleSelection", () => {
  describe("when the id is not yet selected", () => {
    it("adds it to the selection", () => {
      expect(toggleSelection(["a"], "b", 5)).toEqual(["a", "b"]);
    });
  });

  describe("when the id is already selected", () => {
    it("removes it from the selection", () => {
      expect(toggleSelection(["a", "b"], "a", 5)).toEqual(["b"]);
    });
  });

  describe("when the selection is already at the maximum", () => {
    it("ignores a new id", () => {
      expect(toggleSelection(["a", "b"], "c", 2)).toEqual(["a", "b"]);
    });

    it("still allows removing an existing id", () => {
      expect(toggleSelection(["a", "b"], "a", 2)).toEqual(["b"]);
    });
  });
});
