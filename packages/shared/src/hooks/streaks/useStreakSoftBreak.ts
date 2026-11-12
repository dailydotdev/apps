import { useConditionalFeature } from '../useConditionalFeature';
import { featureStreakSoftBreak } from '../../lib/featureManagement';
import type { UserStreak } from '../../graphql/users';

/**
 * The streak just reset and the reader has a best to point back at, so the
 * streak surfaces lead with that instead of the 0. The flag is only evaluated
 * in that state, so readers with a live streak never enter the experiment.
 */
export const useStreakSoftBreak = (
  streak?: Pick<UserStreak, 'current' | 'max'>,
): boolean => {
  const shouldEvaluate = streak?.current === 0 && streak.max > 0;
  const { value } = useConditionalFeature({
    feature: featureStreakSoftBreak,
    shouldEvaluate,
  });

  return shouldEvaluate && value;
};
