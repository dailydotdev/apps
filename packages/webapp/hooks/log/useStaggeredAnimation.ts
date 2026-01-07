/**
 * Hook for staggered animation delays
 */
export function useStaggeredAnimation(
  itemCount: number,
  baseDelay = 0,
  stagger = 100,
): number[] {
  return Array.from({ length: itemCount }, (_, i) => baseDelay + i * stagger);
}
