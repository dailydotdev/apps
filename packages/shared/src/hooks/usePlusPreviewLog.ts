import { useMemo } from 'react';
import type { TargetId } from '../lib/log';
import { LogEvent } from '../lib/log';
import { usePlusSubscription } from './usePlusSubscription';

const previewExtra = { origin: 'preview' };

export const usePlusPreviewLog = (
  targetId: TargetId,
): { logPreviewOpen: () => void; logPreviewAction: () => void } => {
  const { logSubscriptionEvent } = usePlusSubscription();

  return useMemo(
    () => ({
      logPreviewOpen: () =>
        logSubscriptionEvent({
          event_name: LogEvent.Impression,
          target_id: targetId,
          extra: previewExtra,
        }),
      logPreviewAction: () =>
        logSubscriptionEvent({
          event_name: LogEvent.UpgradeSubscription,
          target_id: targetId,
          extra: previewExtra,
        }),
    }),
    [logSubscriptionEvent, targetId],
  );
};
