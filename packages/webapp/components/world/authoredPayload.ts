/**
 * One serialisation for every authored-payload comparison.
 *
 * A payload crosses machine boundaries twice (CLI to page, page to API and
 * back), and nothing on that path promises to keep JSON key order (jsonb
 * storage reorders keys). Every hash and equality check on this side goes
 * through the sorted form, so an untouched payload always compares equal to
 * itself no matter which leg of the trip it came back from.
 */

const sorted = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sorted);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, sorted((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
};

export const stableWorldJson = (value: unknown): string =>
  JSON.stringify(sorted(value));

/* Payload objects are immutable once parsed and get hashed from several angles
   (unsaved counts, merges, saves), so the hash rides with the object. */
const hashes = new WeakMap<object, string>();

/** Same FNV-1a as world-kit's `hashSource`, over the stable form. */
export const worldPayloadHash = (value: unknown): string => {
  const cacheable = !!value && typeof value === 'object';
  if (cacheable) {
    const known = hashes.get(value as object);
    if (known) {
      return known;
    }
  }
  const source = stableWorldJson(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < source.length; index += 1) {
    // eslint-disable-next-line no-bitwise
    hash ^= source.charCodeAt(index);
    // eslint-disable-next-line no-bitwise
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  const digest = hash.toString(16).padStart(8, '0');
  if (cacheable) {
    hashes.set(value as object, digest);
  }
  return digest;
};
