import { useConditionalFeature } from '../useConditionalFeature';
import { useFeaturesReadyContext } from '../../components/GrowthBookProvider';
import { featureStreakSoftBreak } from '../../lib/featureManagement';
import type { UserStreak } from '../../graphql/users';

interface UseStreakSoftBreak {
  isSoftBreak: boolean;
  /**
   * The flag is evaluated and GrowthBook has not settled yet. Uses `settled`,
   * not `ready`: a boot with no features never becomes ready, and waiting on
   * it would hide the gated surface for good in both arms.
   */
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
  const { settled } = useFeaturesReadyContext();
  const { value } = useConditionalFeature({
    feature: featureStreakSoftBreak,
    shouldEvaluate,
  });

  return {
    isSoftBreak: shouldEvaluate && value,
    isLoading: shouldEvaluate && !settled,
  };
};
