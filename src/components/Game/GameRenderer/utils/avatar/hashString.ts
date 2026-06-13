// Small deterministic string hash (FNV-1a, 32-bit). Used to derive a stable
// pseudo-random look for each character's placeholder avatar from its id, so
// the same character always renders the same face.
const FNV_OFFSET = 0x81_1c_9d_c5;
const FNV_PRIME = 0x01_00_01_93;

export const hashString = (value: string): number => {
  let hash = FNV_OFFSET;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, FNV_PRIME);
  }

  // Coerce to an unsigned 32-bit integer.
  return hash >>> 0;
};
