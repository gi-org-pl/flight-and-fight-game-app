import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const destroy = vi.fn();
const gameConstructor = vi.fn();

vi.mock("phaser", () => ({
  default: {
    Game: class {
      constructor(config: unknown) {
        gameConstructor(config);
      }
      destroy = destroy;
    },
  },
}));

vi.mock("./utils/config/createGameConfig", () => ({
  createGameConfig: (parent: HTMLElement) => ({ parent }),
}));

import GameRenderer from "./GameRenderer";

describe("<GameRenderer />", () => {
  afterEach(() => {
    cleanup();
    gameConstructor.mockClear();
    destroy.mockClear();
  });

  describe("when mounted", () => {
    it("creates a single Phaser game bound to the container", () => {
      const { container } = render(<GameRenderer />);

      expect(gameConstructor).toHaveBeenCalledTimes(1);
      expect(gameConstructor).toHaveBeenCalledWith({
        parent: container.firstChild,
      });
    });

    it("applies the provided className to the host element", () => {
      const { container } = render(<GameRenderer className="custom" />);

      expect(container.firstChild).toHaveClass("custom");
    });
  });

  describe("when unmounted", () => {
    it("destroys the Phaser game", () => {
      const { unmount } = render(<GameRenderer />);

      unmount();

      expect(destroy).toHaveBeenCalledWith(true);
    });
  });
});
