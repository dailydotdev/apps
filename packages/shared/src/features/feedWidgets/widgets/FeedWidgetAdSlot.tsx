import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import type { Ad } from '../../../graphql/posts';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useAdQuery } from '../../monetization/useAdQuery';
import type { ViewabilityData } from '../../monetization/viewability';
import { viewabilityLogExtra } from '../../monetization/viewability';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { useCachedTokenRecovery } from '../../../hooks/useCachedTokenRecovery';
import { ImpressionStatus } from '../../../hooks/feed/useLogImpression';
import { AdActions, AdPlacement } from '../../../lib/ads';
import { adLogEvent } from '../../../lib/feed';
import { Origin } from '../../../lib/log';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { IconSize } from '../../../components/Icon';
import { LockIcon } from '../../../components/icons/Lock';
import { FeedHeroAdCard } from '../../../components/feeds/hero/FeedHeroAdCard';

/**
 * The creative for the rail's pinned slot. One per page view, like the hero's.
 * Fetching it logs nothing: the slot logs its impression once it is on screen.
 */
export const useFeedWidgetAd = ({
  enabled,
}: {
  enabled: boolean;
}): { ad?: Ad; isEnabled: boolean } => {
  const { user, isTokenValid } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const queryKey = generateQueryKey(RequestKey.Ads, user, 'feed-widgets');
  const isEnabled = enabled && isTokenValid && !isPlus;
  const { data: ad } = useAdQuery({
    placement: AdPlacement.Feed,
    queryKey,
    enabled: isEnabled,
    staleTime: StaleTime.OneHour,
  });
  // The ad query suffixes the consent to this key, so it matches as a prefix.
  useCachedTokenRecovery({ queryKey, enabled: isEnabled });

  return { ad: ad ?? undefined, isEnabled };
};

/**
 * The third slot of the rail: ours. Always Tall, never in the reader's list,
 * so no reorder can move it; edit mode says so instead of offering controls.
 */
export const FeedWidgetAdSlot = ({
  ad,
  isEditing,
  className,
}: {
  ad?: Ad;
  isEditing: boolean;
  className?: string;
}): ReactElement | null => {
  const { logEvent } = useLogContext();
  // The feed ads' own terms: half the creative on screen. The slot can sit
  // past the rail's visible columns, so having the ad is not enough.
  const { ref: inViewRef, inView } = useInView({ threshold: 0.5 });

  const onAdAction = useCallback(
    (action: AdActions, extra?: Record<string, unknown>) => {
      if (!ad) {
        return;
      }

      logEvent(
        adLogEvent(action, ad, {
          extra: { origin: Origin.FeedWidgets, ...extra },
        }),
      );
    },
    [ad, logEvent],
  );

  useEffect(() => {
    if (!inView || !ad || ad.impressionStatus === ImpressionStatus.LOGGED) {
      return;
    }

    onAdAction(AdActions.Impression);
    // eslint-disable-next-line no-param-reassign
    ad.impressionStatus = ImpressionStatus.LOGGED;
  }, [ad, inView, onAdAction]);

  return (
    <div
      ref={inViewRef}
      className={classNames(
        'relative flex min-h-0 min-w-0 flex-col transition-opacity',
        isEditing && 'opacity-60',
        className,
      )}
      data-testid="feedWidgetAdSlot"
    >
      {ad ? (
        <FeedHeroAdCard
          ad={ad}
          onLinkClick={() => onAdAction(AdActions.Click)}
          onViewable={(_, data: ViewabilityData) =>
            onAdAction(AdActions.Viewable, viewabilityLogExtra(data))
          }
        />
      ) : (
        <div className="min-h-0 flex-1 rounded-16 border border-border-subtlest-tertiary" />
      )}
      {isEditing && (
        <span className="absolute -right-2 -top-2 z-2 flex h-6 items-center gap-1 rounded-max bg-surface-float px-2 text-text-secondary shadow-2 typo-caption2">
          <LockIcon size={IconSize.Size16} />
          Pinned by daily.dev
        </span>
      )}
    </div>
  );
};
