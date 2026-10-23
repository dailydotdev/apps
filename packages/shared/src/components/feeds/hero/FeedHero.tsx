import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo } from 'react';
import type { PostHighlight } from '../../../graphql/highlights';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import { viewabilityLogExtra } from '../../../features/monetization/viewability';
import { useLogContext } from '../../../contexts/LogContext';
import { ImpressionStatus } from '../../../hooks/feed/useLogImpression';
import {
  adLogEvent,
  feedHighlightsLogEvent,
  usePostLogEvent,
} from '../../../lib/feed';
import { AdActions } from '../../../lib/ads';
import { LogEvent, Origin } from '../../../lib/log';
import { FeedHeroSection } from './FeedHeroSection';
import { useFeedHeroAd } from './useFeedHeroAd';
import { useFeedHeroData } from './useFeedHeroData';
import { useFeedHeroCardProps } from './useFeedHeroCardProps';

const FEED_HERO_LIST_LENGTH = 6;

/**
 * The carousel and the Happening Now list are two lists, not one: `feedHero`
 * grades the cards across editorial highlights and lifecycle states, while the
 * rows beside them stay major headlines. A post can be in both, or in one.
 */
export const FeedHero = ({
  feedName,
  className,
  onAdVisibleChange,
  onRenderedChange,
}: {
  /** For the headline click events, which the in-feed card also reports. */
  feedName: string;
  className?: string;
  /** Lets the feed below stand its own first ad down while the hero shows one. */
  onAdVisibleChange?: (isVisible: boolean) => void;
  /**
   * Whether the hero found anything to show. It returns `null` without posts,
   * and the grid has to take back the highlights card and its first-row wide
   * cards when it does, or the reader gets neither.
   */
  onRenderedChange?: (isRendered: boolean) => void;
}): ReactElement | null => {
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();

  const { ad, placement, shape } = useFeedHeroAd();

  const { queryKey, posts, highlights } = useFeedHeroData();
  const cardProps = useFeedHeroCardProps({ queryKey, feedName });

  const isRendered = posts.length > 0;
  const adPlacement = isRendered ? placement : 'none';
  const isAdShown = adPlacement !== 'none';

  // Stacked, the lead story is already a card above the list, so drop it from
  // the list rather than showing it twice a few pixels apart. Matched on the
  // post, not the position: the cards and the headlines are separate lists.
  const railHighlights = useMemo(() => {
    const leadPostId = posts[0]?.id;
    // The query fetches enough for the widget rail; the hero's list is sized
    // for the API's default.
    const shown = highlights.slice(0, FEED_HERO_LIST_LENGTH);

    if (shape.layout !== 'stacked' || !leadPostId) {
      return shown;
    }

    return shown.filter(({ post }) => post.id !== leadPostId);
  }, [highlights, posts, shape.layout]);

  const onAdAction = useCallback(
    (action: AdActions, extra?: Record<string, unknown>) => {
      if (!ad) {
        return;
      }

      logEvent(
        adLogEvent(action, ad, {
          extra: { origin: Origin.FeedHero, ...extra },
        }),
      );
    },
    [ad, logEvent],
  );

  const logHighlightsClick = useCallback(
    (action: string, clickedHighlight?: PostHighlight, position?: number) =>
      logEvent(
        feedHighlightsLogEvent(LogEvent.Click, {
          feedName,
          action,
          position,
          count: railHighlights.length,
          clickedHighlight,
          highlightIds: railHighlights.map(({ id }) => id),
          origin: Origin.Feed,
        }),
      ),
    [feedName, logEvent, railHighlights],
  );

  useEffect(() => {
    onAdVisibleChange?.(isAdShown);
  }, [isAdShown, onAdVisibleChange]);

  useEffect(() => {
    onRenderedChange?.(isRendered);
  }, [isRendered, onRenderedChange]);

  useEffect(() => {
    // Gated on `isAdShown`, not just on the ad existing: logging here while the
    // hero renders nothing would mark the cached ad LOGGED and swallow the
    // impression for the render that actually puts it on screen.
    if (!ad || !isAdShown || ad.impressionStatus === ImpressionStatus.LOGGED) {
      return;
    }

    onAdAction(AdActions.Impression);
    ad.impressionStatus = ImpressionStatus.LOGGED;
  }, [ad, isAdShown, onAdAction]);

  if (!isRendered) {
    return null;
  }

  return (
    <FeedHeroSection
      className={className}
      posts={posts}
      highlights={railHighlights}
      ad={isAdShown ? ad : undefined}
      adPlacement={adPlacement}
      shape={shape}
      cardProps={cardProps}
      onPostImpression={(post) =>
        logEvent(
          postLogEvent(LogEvent.Impression, post, {
            extra: { origin: Origin.FeedHero },
          }),
        )
      }
      onHighlightClick={(highlight, position) =>
        logHighlightsClick('highlight_click', highlight, position)
      }
      onReadAllClick={() => logHighlightsClick('read_all_click')}
      onAdLinkClick={() => onAdAction(AdActions.Click)}
      onAdViewable={(_, data: ViewabilityData) =>
        onAdAction(AdActions.Viewable, viewabilityLogExtra(data))
      }
    />
  );
};
