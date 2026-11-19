import { useCallback } from 'react';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import type { Origin } from '../../lib/log';
import type { Picks } from '../../graphql/picks';

interface UseSharePicks {
  openShareSheet: (picks: Picks, origin: Origin) => void;
}

export const useSharePicks = (): UseSharePicks => {
  const { openModal } = useLazyModal();

  const openShareSheet = useCallback(
    (picks: Picks, origin: Origin) => {
      openModal({ type: LazyModal.SharePicks, props: { picks, origin } });
    },
    [openModal],
  );

  return { openShareSheet };
};
