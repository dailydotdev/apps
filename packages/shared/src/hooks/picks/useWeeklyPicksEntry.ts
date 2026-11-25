import { useCallback, useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
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
 * The users the home card has enrolled on this device, in either arm. Per
 * user rather than per device, so an account switch on a shared browser
 * does not carry the enrollment over.
 */
export const useWeeklyPicksEnrolled = (): [
  isEnrolled: boolean,
  enroll: () => Promise<void>,
  isFetched: boolean,
] => {
  const { user } = useAuthContext();
  const [stored, setEnrolled, isFetched] = usePersistentContext<string[]>(
    PersistentContextKeys.WeeklyPicksEnrolled,
    [],
  );
  // Null until the device read lands
  const enrolled = useMemo(() => stored ?? [], [stored]);
  const isEnrolled = !!user && enrolled.includes(user.id);
  const enroll = useCallback(
    () =>
      user && !isEnrolled
        ? setEnrolled([...enrolled, user.id])
        : Promise.resolve(),
    [user, isEnrolled, enrolled, setEnrolled],
  );

  return [isEnrolled, enroll, isFetched];
};

/**
 * The picks flag for entry points other than the home card. It is evaluated
 * only for readers the card has already enrolled, so visiting these pages
 * never adds anyone to the experiment.
 */
export const useWeeklyPicksEntry = ({
  shouldEvaluate = true,
}: UseWeeklyPicksEntryProps = {}): UseWeeklyPicksEntry => {
  const [isEnrolled, , isEnrolledFetched] = useWeeklyPicksEnrolled();
  const shouldEvaluateFlag = shouldEvaluate && isEnrolled;
  const { value, isLoading } = useConditionalFeature({
    feature: featureWeeklyPicks,
    shouldEvaluate: shouldEvaluateFlag,
  });

  return {
    isEnabled: shouldEvaluateFlag && !isLoading && !!value,
    isLoading: !isEnrolledFetched || (shouldEvaluateFlag && isLoading),
  };
};
