import { useCallback } from 'react';
import { useLazyModal } from '../useLazyModal';
import { useFeature } from '../../components/GrowthBookProvider';
import { LazyModal } from '../../components/modals/common/types';
import { featureWeeklyPicks } from '../../lib/featureManagement';
import type { Origin } from '../../lib/log';
import type { Picks } from '../../graphql/picks';

interface UseSharePicks {
  /** Opens the share sheet, or does nothing when weekly picks is off. */
  openShareSheet: (picks: Picks, origin: Origin) => void;
}

export const useSharePicks = (): UseSharePicks => {
  const isEnabled = useFeature(featureWeeklyPicks);
  const { openModal } = useLazyModal();

  const openShareSheet = useCallback(
    (picks: Picks, origin: Origin) => {
      if (!isEnabled) {
        return;
      }

      openModal({ type: LazyModal.SharePicks, props: { picks, origin } });
    },
    [isEnabled, openModal],
  );

  return { openShareSheet };
};
