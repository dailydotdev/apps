/**
 * Interleave the inputs round-robin. Duplicate values are dropped on first
 * occurrence, preserving the round-robin ordering. Used to balance
 * recommendations across personas so the densest persona doesn't dominate
 * the deck seed.
 */
export function roundRobinMerge<T>(streams: readonly T[][]): T[] {
  const merged: T[] = [];
  const seen = new Set<T>();
  const maxLength = streams.reduce(
    (max, stream) => Math.max(max, stream.length),
    0,
  );

  Array.from({ length: maxLength }).forEach((_, i) => {
    streams.forEach((stream) => {
      const value = stream[i];
      if (value !== undefined && !seen.has(value)) {
        seen.add(value);
        merged.push(value);
      }
    });
  });

  return merged;
}
