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
import { majorHeadlinesQueryOptions } from '../../../graphql/highlights';
import type { ViewabilityData } from '../../../features/monetization/viewability';
import { viewabilityLogExtra } from '../../../features/monetization/viewability';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useVotePost } from '../../../hooks';
import { useBookmarkPost } from '../../../hooks/useBookmarkPost';
import { useCopyLink } from '../../../hooks/useCopy';
import { ImpressionStatus } from '../../../hooks/feed/useLogImpression';
import { adLogEvent, usePostLogEvent } from '../../../lib/feed';
import { AdActions } from '../../../lib/ads';
import { LogEvent, Origin } from '../../../lib/log';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { FeedHeroSection } from './FeedHeroSection';
import { useFeedHeroAd } from './useFeedHeroAd';

const HIGHLIGHT_COUNT = 6;
const FEATURED_POST_COUNT = 4;

/**
 * The carousel and the Happening Now list are the same headlines: the top few
 * get their full post fetched for a card, the rest stay as rows.
 */
export const FeedHero = ({
  className,
}: {
  className?: string;
}): ReactElement | null => {
  const { user, tokenRefreshed } = useAuthContext();
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { toggleBookmark } = useBookmarkPost();
  const [, copyLink] = useCopyLink();

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

  const { ad, isVisible: isAdVisible } = useFeedHeroAd(true);

  const onAdAction = useCallback(
    (action: AdActions, extra?: Record<string, unknown>) => {
      if (!ad) {
        return;
      }

      logEvent(
        adLogEvent(action, ad, { extra: { origin: 'feed hero', ...extra } }),
      );
    },
    [ad, logEvent],
  );

  useEffect(() => {
    if (
      !ad ||
      !isAdVisible ||
      ad.impressionStatus === ImpressionStatus.LOGGED
    ) {
      return;
    }

    onAdAction(AdActions.Impression);
    ad.impressionStatus = ImpressionStatus.LOGGED;
  }, [ad, isAdVisible, onAdAction]);

  const cardProps = useMemo(
    () => ({
      onPostClick: (post: Post) =>
        logEvent(
          postLogEvent(LogEvent.Click, post, {
            extra: { origin: Origin.Feed },
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

  if (!posts.length) {
    return null;
  }

  return (
    <FeedHeroSection
      className={className}
      posts={posts}
      highlights={highlights}
      ad={isAdVisible ? ad : undefined}
      cardProps={cardProps}
      onAdLinkClick={() => onAdAction(AdActions.Click)}
      onAdViewable={(_, data: ViewabilityData) =>
        onAdAction(AdActions.Viewable, viewabilityLogExtra(data))
      }
    />
  );
};
