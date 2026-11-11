import { featureWeeklyPicks } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import usePersistentContext, {
  PersistentContextKeys,
} from '../usePersistentContext';

interface UseWeeklyPicksEntryProps {
  shouldEvaluate?: boolean;
}

interface UseWeeklyPicksEntry {
  isEnabled: boolean;
  isLoading: boolean;
}

/**
 * The picks flag for entry points other than the home card. It is evaluated
 * only for readers the card has already enrolled, so visiting these pages
 * never adds anyone to the experiment.
 */
export const useWeeklyPicksEntry = ({
  shouldEvaluate = true,
}: UseWeeklyPicksEntryProps = {}): UseWeeklyPicksEntry => {
  const [isEnrolled, , isEnrolledFetched] = usePersistentContext<boolean>(
    PersistentContextKeys.WeeklyPicksEnrolled,
    false,
  );
  const shouldEvaluateFlag = shouldEvaluate && !!isEnrolled;
  const { value, isLoading } = useConditionalFeature({
    feature: featureWeeklyPicks,
    shouldEvaluate: shouldEvaluateFlag,
  });

  return {
    isEnabled: shouldEvaluateFlag && !isLoading && !!value,
    isLoading: !isEnrolledFetched || (shouldEvaluateFlag && isLoading),
  };
};
