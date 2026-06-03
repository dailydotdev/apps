/** Minimum swipes before "Continue" unlocks. Also the point where the bar fills. */
export const SWIPE_ONBOARDING_MIN_TO_UNLOCK = 10;

/** Swipe count at which the bar is full and "all set" copy starts. */
export const SWIPE_ONBOARDING_REFINE_TARGET = SWIPE_ONBOARDING_MIN_TO_UNLOCK;

/**
 * Progress bar fill (0 to 100). Linear from 0% to 100% across the first
 * {@link SWIPE_ONBOARDING_MIN_TO_UNLOCK} swipes; clamps at 100% afterwards.
 */
export function getSwipeOnboardingBarProgress(progressCount: number): number {
  const n = Math.max(0, progressCount);

  if (n >= SWIPE_ONBOARDING_MIN_TO_UNLOCK) {
    return 100;
  }

  return (n / SWIPE_ONBOARDING_MIN_TO_UNLOCK) * 100;
}
