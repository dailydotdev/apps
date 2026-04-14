/** Minimum swipes before “Continue” unlocks (tier 0 ends at this minus 1). */
export const SWIPE_ONBOARDING_MIN_TO_UNLOCK = 5;

/** Second staircase (refine tier starts at this count). */
export const SWIPE_ONBOARDING_IMPROVE_MILESTONE = 10;

/** Swipe count at which the bar is full and “all set” copy starts. */
export const SWIPE_ONBOARDING_REFINE_TARGET = 20;

/** Number of equal segments on the onboarding progress bar (25% each). */
export const SWIPE_ONBOARDING_BAR_STAGE_COUNT = 4;

const swipesPerBarStage =
  SWIPE_ONBOARDING_REFINE_TARGET / SWIPE_ONBOARDING_BAR_STAGE_COUNT;

if (!Number.isInteger(swipesPerBarStage)) {
  throw new Error(
    'SWIPE_ONBOARDING_REFINE_TARGET must divide evenly by SWIPE_ONBOARDING_BAR_STAGE_COUNT',
  );
}

const barSegmentPercent = 100 / SWIPE_ONBOARDING_BAR_STAGE_COUNT;

/**
 * Progress bar fill (0 to 100). First {@link SWIPE_ONBOARDING_MIN_TO_UNLOCK} steps
 * animate the full bar from 0% to 100%; after that the bar uses four 25% segments (10 steps
 * each) up to {@link SWIPE_ONBOARDING_REFINE_TARGET}.
 */
export function getSwipeOnboardingBarProgress(progressCount: number): number {
  const n = Math.max(0, progressCount);

  if (n >= SWIPE_ONBOARDING_REFINE_TARGET) {
    return 100;
  }

  if (n < SWIPE_ONBOARDING_MIN_TO_UNLOCK) {
    return (n / SWIPE_ONBOARDING_MIN_TO_UNLOCK) * 100;
  }

  const stageIndex = Math.floor(n / swipesPerBarStage);
  const positionInStage = n % swipesPerBarStage;

  return (
    stageIndex * barSegmentPercent +
    (positionInStage / swipesPerBarStage) * barSegmentPercent
  );
}

export type SwipeOnboardingHeadline = {
  line1: string;
  line2?: string;
};

/** Same progress tiers as swipes; copy refers to tags instead. */
export type SwipeOnboardingProgressCopyVariant = 'swipe' | 'tags';

function unitWord(
  count: number,
  singular: string,
  plural: string,
): string {
  return count === 1 ? singular : plural;
}

/**
 * Main title above the progress bar (one or two lines).
 * Copy is fixed per tier only — counts update in {@link getSwipeOnboardingGuidanceMessage}, not here.
 */
export function getSwipeOnboardingHeadline(
  progressCount: number,
  variant: SwipeOnboardingProgressCopyVariant = 'swipe',
): SwipeOnboardingHeadline {
  const n = Math.max(0, progressCount);

  if (n < SWIPE_ONBOARDING_MIN_TO_UNLOCK) {
    return {
      line1: 'Tune your feed.',
      line2:
        variant === 'tags'
          ? 'Pick at least 5 tags to get started.'
          : 'Swipe on at least 5 posts to get started.',
    };
  }

  if (n >= SWIPE_ONBOARDING_REFINE_TARGET) {
    return {
      line1:
        variant === 'tags'
          ? "You're all set! Keep adding tags to fine-tune."
          : "You're all set! Keep swiping to fine-tune.",
    };
  }

  if (n < SWIPE_ONBOARDING_IMPROVE_MILESTONE) {
    return { line1: 'Keep going, 5 more and it gets better.' };
  }

  return { line1: "You're getting there, 10 more to dial it in." };
}

/**
 * Action-based copy for onboarding progress (swipes or tag picks use the same thresholds).
 */
export function getSwipeOnboardingGuidanceMessage(
  progressCount: number,
  variant: SwipeOnboardingProgressCopyVariant = 'swipe',
): string {
  const n = Math.max(0, progressCount);

  if (n >= SWIPE_ONBOARDING_REFINE_TARGET) {
    return variant === 'tags' ? 'Add tags for fine-tune.' : 'Swipe for fine-tune.';
  }

  if (n >= SWIPE_ONBOARDING_IMPROVE_MILESTONE) {
    const remaining = SWIPE_ONBOARDING_REFINE_TARGET - n;
    return variant === 'tags'
      ? `Pick ${remaining} more ${unitWord(remaining, 'tag', 'tags')}.`
      : `Swipe ${remaining} more ${unitWord(remaining, 'post', 'posts')}.`;
  }

  if (n >= SWIPE_ONBOARDING_MIN_TO_UNLOCK) {
    const remaining = SWIPE_ONBOARDING_IMPROVE_MILESTONE - n;
    return variant === 'tags'
      ? `Pick ${remaining} more ${unitWord(remaining, 'tag', 'tags')}.`
      : `Swipe ${remaining} more ${unitWord(remaining, 'post', 'posts')}.`;
  }

  if (variant === 'tags') {
    if (n === 0) {
      return 'Pick 5 tags to get started.';
    }
    const remaining = SWIPE_ONBOARDING_MIN_TO_UNLOCK - n;
    return `Pick ${remaining} more ${unitWord(remaining, 'tag', 'tags')} to get started.`;
  }

  if (n === 0) {
    return 'Swipe 5 posts to get started.';
  }
  const remaining = SWIPE_ONBOARDING_MIN_TO_UNLOCK - n;
  return `Swipe ${remaining} more ${unitWord(remaining, 'post', 'posts')} to get started.`;
}
