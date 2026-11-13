import type { ReactElement } from 'react';
import { useContext, useEffect, useRef } from 'react';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useActions } from '../../hooks/useActions';
import { useReadingStreak } from '../../hooks/streaks/useReadingStreak';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import { ActionType } from '../../graphql/actions';
import { featureStreakFreeFreezes } from '../../lib/featureManagement';
import AlertContext from '../../contexts/AlertContext';
import { LazyModal } from '../modals/common/types';

/**
 * Opens the "that was your last free freeze" upsell once per account, the
 * first time the client sees the free freezes all used up (`freeFreezes` is 0;
 * it is null for readers who never got them). This covers opening the app
 * from the streak_freeze_depleted notification as well, since the streak
 * query loads on every page. Readers without Cores access cannot buy
 * freezes, so they are not shown it (and still get it once they can).
 */
export const StreakFreeFreezesUpsellPopup = (): ReactElement | null => {
  const { openModal, modal } = useLazyModal();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const { alerts } = useContext(AlertContext);
  const { streak, isStreaksEnabled } = useReadingStreak();
  const hasAccessToCores = useHasAccessToCores();
  const hasUsedFreeFreezes = streak?.freeFreezes === 0;
  const { value: isEnabled } = useConditionalFeature({
    feature: featureStreakFreeFreezes,
    shouldEvaluate: isStreaksEnabled && hasUsedFreeFreezes,
  });
  const hasOpened = useRef(false);
  const hasSeen = checkHasCompleted(ActionType.StreakFreeFreezesUpsell);

  useEffect(() => {
    const shouldSkip = [
      hasOpened.current,
      !isStreaksEnabled,
      !hasUsedFreeFreezes,
      !isEnabled,
      !hasAccessToCores,
      !isActionsFetched,
      hasSeen,
      // the milestone modal goes first
      alerts?.showStreakMilestone === true,
      !!modal,
    ].some(Boolean);

    if (shouldSkip) {
      return;
    }

    hasOpened.current = true;
    completeAction(ActionType.StreakFreeFreezesUpsell);
    openModal({ type: LazyModal.StreakFreeFreezesUpsell });
  }, [
    alerts?.showStreakMilestone,
    completeAction,
    hasAccessToCores,
    hasSeen,
    hasUsedFreeFreezes,
    isActionsFetched,
    isEnabled,
    isStreaksEnabled,
    modal,
    openModal,
  ]);

  return null;
};
