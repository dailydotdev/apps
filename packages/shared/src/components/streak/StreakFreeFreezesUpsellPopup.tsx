import type { ReactElement } from 'react';
import { useContext, useEffect, useRef } from 'react';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useActions } from '../../hooks/useActions';
import { useReadingStreak } from '../../hooks/streaks/useReadingStreak';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';
import { ActionType } from '../../graphql/actions';
import { featureStreakFreeFreezesUpsell } from '../../lib/featureManagement';
import AlertContext from '../../contexts/AlertContext';
import { LazyModal } from '../modals/common/types';

/**
 * Opens the "that was your last free freeze" upsell once per account, the
 * first time the client sees the free freezes all used up (`freeFreezes` is 0;
 * it is null for readers who never got them). This covers opening the app
 * from the streak_freeze_depleted notification as well, since the streak
 * query loads on every page. Readers without Cores access cannot buy
 * freezes, so they are not shown it (and still get it once they can).
 *
 * The client cannot tell whether the last free freeze kept the streak, so a
 * reset in the past week switches to the plain title, which is never untrue.
 */
export const STREAK_FREE_FREEZES_RECENT_RESET_MS = 7 * 24 * 60 * 60 * 1000;

export const StreakFreeFreezesUpsellPopup = (): ReactElement | null => {
  const { openModal, modal } = useLazyModal();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const { alerts } = useContext(AlertContext);
  const { streak, isStreaksEnabled } = useReadingStreak();
  const hasAccessToCores = useHasAccessToCores();
  const hasUsedFreeFreezes = streak?.freeFreezes === 0;
  const { value: isEnabled } = useConditionalFeature({
    feature: featureStreakFreeFreezesUpsell,
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
      // the milestone modal and the restore offer go first
      alerts?.showStreakMilestone === true,
      alerts?.showRecoverStreak === true,
      !!modal,
    ].some(Boolean);

    if (shouldSkip) {
      return;
    }

    const resetAt = streak?.lastReset?.at;
    const wasRecentlyReset =
      !!resetAt &&
      Date.now() - new Date(resetAt).getTime() <
        STREAK_FREE_FREEZES_RECENT_RESET_MS;

    hasOpened.current = true;
    completeAction(ActionType.StreakFreeFreezesUpsell);
    openModal({
      type: LazyModal.StreakFreeFreezesUpsell,
      props: { streakKept: !wasRecentlyReset },
    });
  }, [
    alerts?.showRecoverStreak,
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
    streak?.lastReset?.at,
  ]);

  return null;
};
