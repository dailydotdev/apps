import { useConditionalFeature } from '../useConditionalFeature';
import { featureStreakSoftBreak } from '../../lib/featureManagement';
import type { UserStreak } from '../../graphql/users';

interface UseStreakSoftBreak {
  isSoftBreak: boolean;
  /** The flag is evaluated but GrowthBook has not resolved it yet. */
  isLoading: boolean;
}

/**
 * The streak just reset and the reader has a best to point back at, so the
 * streak surfaces lead with that instead of the 0. The flag is only evaluated
 * in that state, so readers with a live streak never enter the experiment.
 * Every soft-break surface (popup, drawers, sidebar, restore modal) enrols
 * through this hook so the experiment has a single predicate.
 */
export const useStreakSoftBreak = (
  streak?: Pick<UserStreak, 'current' | 'max'>,
): UseStreakSoftBreak => {
  const shouldEvaluate = streak?.current === 0 && streak.max > 0;
  const { value, isLoading } = useConditionalFeature({
    feature: featureStreakSoftBreak,
    shouldEvaluate,
  });

  return {
    isSoftBreak: shouldEvaluate && value,
    isLoading: shouldEvaluate && isLoading,
  };
};
