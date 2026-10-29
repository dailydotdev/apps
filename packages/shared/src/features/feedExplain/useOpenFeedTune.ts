import { useCallback } from 'react';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { useLogContext } from '../../contexts/LogContext';
import type { Origin } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import type { FeedTuneTab } from './types';

/** Opens Tune on the given For You version, and logs where from. */
export const useOpenFeedTune = (
  origin: Origin,
): ((version: number, initialTab?: FeedTuneTab) => void) => {
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();

  return useCallback(
    (version, initialTab) => {
      logEvent({
        event_name: LogEvent.OpenFeedTune,
        extra: JSON.stringify({ origin }),
      });
      openModal({ type: LazyModal.FeedTune, props: { version, initialTab } });
    },
    [logEvent, openModal, origin],
  );
};
