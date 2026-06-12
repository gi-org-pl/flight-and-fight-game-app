import "@testing-library/jest-dom";
import { vi } from "vitest";

// jsdom has no real canvas backend. Phaser runs feature detection (which draws
// to a 2D context) as a side effect of being imported, so we stub getContext
// with a no-op 2D context to let Phaser load under Vitest/jsdom.
HTMLCanvasElement.prototype.getContext = vi.fn(
  () =>
    ({
      fillStyle: "",
      fillRect: vi.fn(),
      getImageData: () => ({ data: [0, 0, 0, 0] }),
      putImageData: vi.fn(),
    }) as unknown as CanvasRenderingContext2D,
) as unknown as typeof HTMLCanvasElement.prototype.getContext;
