/** A debounced function, plus a `cancel` to drop any pending trailing call. */
export interface Debounced<Args extends unknown[]> {
  (...args: Args): void;
  cancel: () => void;
}

/**
 * Trailing-edge debounce: delays invoking `callback` until `delayMs` has passed
 * since the last call. Used to throttle the per-keystroke join check against the
 * API while the player types a session id.
 */
export const debounce = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
): Debounced<Args> => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Args): void => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      callback(...args);
    }, delayMs);
  };

  debounced.cancel = (): void => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  return debounced;
};
