import type { MouseEvent } from 'react';
import { useMemo } from 'react';
import { useRouter } from 'next/router';
import type { QueryKey } from '@tanstack/react-query';
import type { Post } from '../../../graphql/posts';
import type { FeaturedWideCardProps } from '../../cards/common/featuredWide';
import { useLogContext } from '../../../contexts/LogContext';
import { useCopyLink } from '../../../hooks/useCopy';
import { usePostLogEvent } from '../../../lib/feed';
import { LogEvent, Origin } from '../../../lib/log';
import type { PostCacheAdapter } from './useFeedHeroPostActions';
import { useFeedHeroPostActions } from './useFeedHeroPostActions';

/**
 * The handlers the hero's cards take. The card's overlay link cancels its own
 * navigation and leaves opening the post to `onPostClick`, as the feed opens
 * its modal there; the hero has no modal of its own, so it opens the post
 * page. Everything is logged under `origin` (the hero's by default, so its
 * events and the widget rail's stay apart). Vote and bookmark patch the hero's
 * own query: the bare hooks only write the single-post key, which these cards
 * never read.
 */
export const useFeedHeroCardProps = ({
  queryKey,
  feedName,
  origin = Origin.FeedHero,
  cache,
}: {
  queryKey: QueryKey;
  feedName: string;
  /** The surface the events report, so the hero and the rail stay apart. */
  origin?: Origin;
  /** Where the cards' posts live, when not in the hero's own query. */
  cache?: PostCacheAdapter;
}): Omit<FeaturedWideCardProps, 'post'> => {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const [, copyLink] = useCopyLink();
  const { toggleUpvote, toggleDownvote, toggleBookmark } =
    useFeedHeroPostActions({
      queryKey,
      feedName,
      origin,
      cache,
    });

  return useMemo(() => {
    const logClick = (post: Post) =>
      logEvent(
        postLogEvent(LogEvent.Click, post, {
          extra: { origin },
        }),
      );

    return {
      onPostClick: (post: Post) => {
        logClick(post);
        router.push(post.commentsPermalink);
      },
      // A modified click opens the link itself, in a new tab.
      onPostAuxClick: logClick,
      onUpvoteClick: (post: Post, clickOrigin = origin) =>
        toggleUpvote({ payload: post, origin: clickOrigin }),
      onDownvoteClick: (post: Post, clickOrigin = origin) =>
        toggleDownvote({ payload: post, origin: clickOrigin }),
      onBookmarkClick: (post: Post, clickOrigin = origin) =>
        toggleBookmark({ post, origin: clickOrigin }),
      onCopyLinkClick: (_: MouseEvent, post: Post) =>
        copyLink({ link: post.commentsPermalink }),
    };
  }, [
    copyLink,
    logEvent,
    origin,
    postLogEvent,
    router,
    toggleBookmark,
    toggleDownvote,
    toggleUpvote,
  ]);
};
