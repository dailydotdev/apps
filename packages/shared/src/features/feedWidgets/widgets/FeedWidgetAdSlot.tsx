import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import type { Ad } from '../../../graphql/posts';
import { useLogContext } from '../../../contexts/LogContext';
import type { ViewabilityData } from '../../monetization/viewability';
import { viewabilityLogExtra } from '../../monetization/viewability';
import { ImpressionStatus } from '../../../hooks/feed/useLogImpression';
import { AdActions } from '../../../lib/ads';
import { adLogEvent } from '../../../lib/feed';
import { Origin } from '../../../lib/log';
import { IconSize } from '../../../components/Icon';
import { LockIcon } from '../../../components/icons/Lock';
import { AdGrid } from '../../../components/cards/ad/AdGrid';
import { PlaceholderGrid } from '../../../components/cards/placeholder/PlaceholderGrid';

/**
 * The third slot of the rail: ours. Always Tall, never in the reader's list,
 * so no reorder can move it; edit mode says so instead of offering controls.
 */
export const FeedWidgetAdSlot = ({
  ad,
  isEditing,
  isCompact,
  className,
}: {
  ad?: Ad;
  isEditing: boolean;
  /** A tip sits over the slot, so the ad takes what is left of the column. */
  isCompact?: boolean;
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
        // The feed's own ad card, so the slot reads as the ad it replaces.
        <AdGrid
          ad={ad}
          index={0}
          feedIndex={0}
          disableRotation
          isCompact={isCompact}
          domProps={{ className: 'flex-1' }}
          onLinkClick={() => onAdAction(AdActions.Click)}
          onViewable={(_, data: ViewabilityData) =>
            onAdAction(AdActions.Viewable, viewabilityLogExtra(data))
          }
        />
      ) : (
        <PlaceholderGrid className="flex-1" />
      )}
      {isEditing && (
        // Under a tip the slot's corner is the strip's edge, so the label
        // moves inside the ad.
        <span
          className={classNames(
            'absolute z-2 flex h-6 items-center gap-1 rounded-max bg-surface-float px-2 text-text-secondary shadow-2 typo-caption2',
            isCompact ? 'right-2 top-2' : '-right-2 -top-2',
          )}
        >
          <LockIcon size={IconSize.Size16} />
          Pinned by daily.dev
        </span>
      )}
    </div>
  );
};
