import { useCallback, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useLogContext } from '../contexts/LogContext';
import type { Origin } from '../lib/log';
import { LogEvent } from '../lib/log';
import type { ResolvedCreative } from '../lib/engagementAds';
import { getEngagementLogExtra } from '../lib/engagementAds';

type UseEngagementPlacementLog = {
  ref: (node?: Element | null) => void;
  onClick: () => void;
};

// Impression (once, at 50% visibility) + click logging for engagement-ad
// placements (top banner / feed strip). Both events carry the creative's
// gen_id (and source_id when it's a CPA creative) in `extra`, matching how the
// other engagement surfaces (feed impressions, upvotes, post page, profile
// stack) attribute campaigns.
export const useEngagementPlacementLog = ({
  creative,
  origin,
}: {
  creative: ResolvedCreative;
  origin: Origin;
}): UseEngagementPlacementLog => {
  const { logEvent } = useLogContext();
  const { ref, inView } = useInView({ threshold: 0.5 });
  const hasLoggedImpression = useRef(false);
  const { name } = creative;

  const buildExtra = useCallback(
    () => JSON.stringify({ origin, ...getEngagementLogExtra(creative) }),
    [origin, creative],
  );

  useEffect(() => {
    if (!inView || hasLoggedImpression.current) {
      return;
    }
    hasLoggedImpression.current = true;
    logEvent({
      event_name: LogEvent.Impression,
      target_id: name,
      extra: buildExtra(),
    });
  }, [inView, logEvent, name, buildExtra]);

  const onClick = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_id: name,
      extra: buildExtra(),
    });
  }, [logEvent, name, buildExtra]);

  return { ref, onClick };
};
