import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Post } from '../../../graphql/posts';
import { gqlClient } from '../../../graphql/common';
import type { FeedHeroData } from '../../../graphql/feed';
import {
  FEED_HERO_QUERY,
  supportedTypesForPrivateSources,
} from '../../../graphql/feed';
import type { PostHighlight } from '../../../graphql/highlights';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import { viewabilityLogExtra } from '../../../features/monetization/viewability';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useCopyLink } from '../../../hooks/useCopy';
import { ImpressionStatus } from '../../../hooks/feed/useLogImpression';
import {
  adLogEvent,
  feedHighlightsLogEvent,
  usePostLogEvent,
} from '../../../lib/feed';
import { AdActions } from '../../../lib/ads';
import { LogEvent, Origin } from '../../../lib/log';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { FeedHeroSection } from './FeedHeroSection';
import { useFeedHeroAd } from './useFeedHeroAd';
import { useFeedHeroPostActions } from './useFeedHeroPostActions';

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
  const { user, isTokenValid } = useAuthContext();
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const [, copyLink] = useCopyLink();

  const { ad, placement, shape } = useFeedHeroAd();

  const queryKey = useMemo(
    () => generateQueryKey(RequestKey.FeedHero, user),
    [user],
  );
  // Vote and bookmark patch the hero's own query: the bare hooks only write the
  // single-post key, which these cards never read.
  const { toggleUpvote, toggleDownvote, toggleBookmark } =
    useFeedHeroPostActions({
      queryKey,
      feedName,
      origin: Origin.FeedHero,
    });

  const { data: hero } = useQuery({
    queryKey,
    queryFn: () =>
      gqlClient.request<FeedHeroData>(FEED_HERO_QUERY, {
        loggedIn: !!user,
        supportedTypes: supportedTypesForPrivateSources,
      }),
    enabled: isTokenValid,
    // The same window `majorHeadlinesQueryOptions` gives the in-feed card, so
    // the two surfaces the experiment compares are equally fresh.
    staleTime: StaleTime.OneMinute,
  });

  const highlights = useMemo(() => hero?.feedHero?.highlights ?? [], [hero]);
  const posts: Post[] = useMemo(() => hero?.feedHero?.posts ?? [], [hero]);

  const isRendered = posts.length > 0;
  const adPlacement = isRendered ? placement : 'none';
  const isAdShown = adPlacement !== 'none';

  // Stacked, the lead story is already a card above the list, so drop it from
  // the list rather than showing it twice a few pixels apart. Matched on the
  // post, not the position: the cards and the headlines are separate lists.
  const railHighlights = useMemo(() => {
    const leadPostId = posts[0]?.id;

    if (shape.layout !== 'stacked' || !leadPostId) {
      return highlights;
    }

    return highlights.filter(({ post }) => post.id !== leadPostId);
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

  const cardProps = useMemo(
    () => ({
      onPostClick: (post: Post) =>
        logEvent(
          postLogEvent(LogEvent.Click, post, {
            extra: { origin: Origin.FeedHero },
          }),
        ),
      onUpvoteClick: (post: Post, origin = Origin.FeedHero) =>
        toggleUpvote({ payload: post, origin }),
      onDownvoteClick: (post: Post, origin = Origin.FeedHero) =>
        toggleDownvote({ payload: post, origin }),
      onBookmarkClick: (post: Post, origin = Origin.FeedHero) =>
        toggleBookmark({ post, origin }),
      onCopyLinkClick: (_: React.MouseEvent, post: Post) =>
        copyLink({ link: post.commentsPermalink }),
    }),
    [
      copyLink,
      logEvent,
      postLogEvent,
      toggleBookmark,
      toggleDownvote,
      toggleUpvote,
    ],
  );

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
