import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Post } from '../../../graphql/posts';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import {
  FEED_BY_IDS_QUERY,
  supportedTypesForPrivateSources,
} from '../../../graphql/feed';
import type { PostHighlight } from '../../../graphql/highlights';
import { majorHeadlinesQueryOptions } from '../../../graphql/highlights';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import { viewabilityLogExtra } from '../../../features/monetization/viewability';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useVotePost } from '../../../hooks';
import { useBookmarkPost } from '../../../hooks/useBookmarkPost';
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

const HIGHLIGHT_COUNT = 6;
const FEATURED_POST_COUNT = 4;
// Distinct from `Origin.Feed` so the experiment can tell the hero's clicks and
// impressions apart from the grid's. Matches the ad events' own origin.
const HERO_ORIGIN = 'feed hero';

/**
 * The carousel and the Happening Now list are the same headlines: the top few
 * get their full post fetched for a card, the rest stay as rows.
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
  const { user, tokenRefreshed } = useAuthContext();
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { toggleBookmark } = useBookmarkPost();
  const [, copyLink] = useCopyLink();

  const { ad, placement, shape } = useFeedHeroAd();

  const { data: headlines } = useQuery({
    ...majorHeadlinesQueryOptions({ first: HIGHLIGHT_COUNT }),
    enabled: tokenRefreshed,
  });
  const highlights = useMemo(
    () => headlines?.majorHeadlines?.edges?.map(({ node }) => node) ?? [],
    [headlines],
  );

  const postIds = useMemo(
    () => highlights.slice(0, FEATURED_POST_COUNT).map(({ post }) => post.id),
    [highlights],
  );

  const { data: featured } = useQuery({
    queryKey: generateQueryKey(RequestKey.FeedByIds, user, 'hero', ...postIds),
    queryFn: () =>
      gqlClient.request<{ page: Connection<Post> }>(FEED_BY_IDS_QUERY, {
        first: postIds.length,
        postIds,
        loggedIn: !!user,
        supportedTypes: supportedTypesForPrivateSources,
      }),
    enabled: tokenRefreshed && postIds.length > 0,
    staleTime: StaleTime.Default,
  });

  // `feedByIds` answers in its own order, so re-key by id to keep the carousel
  // in the same order as the headlines beside it.
  const posts = useMemo(() => {
    const byId = new Map(
      featured?.page?.edges?.map(({ node }) => [node.id, node]) ?? [],
    );

    return postIds.map((id) => byId.get(id)).filter(Boolean) as Post[];
  }, [featured, postIds]);

  const isRendered = posts.length > 0;
  const adPlacement = isRendered ? placement : 'none';
  const isAdShown = adPlacement !== 'none';

  // Stacked, the lead story is already a card above the list, so drop it from
  // the list rather than showing it twice a few pixels apart.
  const railHighlights =
    shape.layout === 'stacked' ? highlights.slice(1) : highlights;

  const onAdAction = useCallback(
    (action: AdActions, extra?: Record<string, unknown>) => {
      if (!ad) {
        return;
      }

      logEvent(
        adLogEvent(action, ad, { extra: { origin: HERO_ORIGIN, ...extra } }),
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
            extra: { origin: HERO_ORIGIN },
          }),
        ),
      onUpvoteClick: (post: Post, origin = Origin.Feed) =>
        toggleUpvote({ payload: post, origin }),
      onDownvoteClick: (post: Post, origin = Origin.Feed) =>
        toggleDownvote({ payload: post, origin }),
      onBookmarkClick: (post: Post, origin = Origin.Feed) =>
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
            extra: { origin: HERO_ORIGIN },
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
