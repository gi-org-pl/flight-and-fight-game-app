/** Derive a human-readable display name from a character type enum value. */
export const toDisplayName = (type: string): string =>
  type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
