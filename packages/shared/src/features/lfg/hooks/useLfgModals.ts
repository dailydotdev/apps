import { useCallback } from 'react';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { useLogContext } from '../../../contexts/LogContext';
import type { Origin } from '../../../lib/log';
import { LogEvent, TargetType } from '../../../lib/log';
import type { LfgHelper, LfgPost } from '../types';

type UseLfgModals = {
  openReachOut: (post: LfgPost, origin: Origin) => void;
  openHelper: (origin: Origin, prefill?: Partial<LfgHelper>) => void;
};

export const useLfgModals = (): UseLfgModals => {
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();

  const openReachOut = useCallback(
    (post: LfgPost, origin: Origin) => {
      logEvent({
        event_name: LogEvent.StartLfgReachOut,
        target_type: TargetType.LfgPost,
        target_id: post.id,
        extra: JSON.stringify({ origin, kind: post.kind }),
      });
      openModal({ type: LazyModal.LfgReachOut, props: { post, origin } });
    },
    [logEvent, openModal],
  );

  const openHelper = useCallback(
    (origin: Origin, prefill?: Partial<LfgHelper>) => {
      logEvent({
        event_name: LogEvent.OpenLfgHelper,
        extra: JSON.stringify({ origin }),
      });
      openModal({ type: LazyModal.LfgHelper, props: { origin, prefill } });
    },
    [logEvent, openModal],
  );

  return { openReachOut, openHelper };
};
