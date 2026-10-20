import type { MouseEvent } from 'react';
import { useMemo } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import type { Post } from '../../../graphql/posts';
import type { FeaturedWideCardProps } from '../../cards/common/featuredWide';
import { useLogContext } from '../../../contexts/LogContext';
import { useCopyLink } from '../../../hooks/useCopy';
import { usePostLogEvent } from '../../../lib/feed';
import { LogEvent, Origin } from '../../../lib/log';
import { useFeedHeroPostActions } from './useFeedHeroPostActions';

/**
 * The handlers the hero's cards take, logged under `origin` (the hero's by
 * default, so its events and the widget rail's stay apart). Vote
 * and bookmark patch the hero's own query: the bare hooks only write the
 * single-post key, which these cards never read.
 */
export const useFeedHeroCardProps = ({
  queryKey,
  feedName,
  origin = Origin.FeedHero,
}: {
  queryKey: QueryKey;
  feedName: string;
  /** The surface the events report, so the hero and the rail stay apart. */
  origin?: Origin;
}): Omit<FeaturedWideCardProps, 'post'> => {
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const [, copyLink] = useCopyLink();
  const { toggleUpvote, toggleDownvote, toggleBookmark } =
    useFeedHeroPostActions({
      queryKey,
      feedName,
      origin,
    });

  return useMemo(
    () => ({
      onPostClick: (post: Post) =>
        logEvent(
          postLogEvent(LogEvent.Click, post, {
            extra: { origin },
          }),
        ),
      onUpvoteClick: (post: Post, clickOrigin = origin) =>
        toggleUpvote({ payload: post, origin: clickOrigin }),
      onDownvoteClick: (post: Post, clickOrigin = origin) =>
        toggleDownvote({ payload: post, origin: clickOrigin }),
      onBookmarkClick: (post: Post, clickOrigin = origin) =>
        toggleBookmark({ post, origin: clickOrigin }),
      onCopyLinkClick: (_: MouseEvent, post: Post) =>
        copyLink({ link: post.commentsPermalink }),
    }),
    [
      copyLink,
      logEvent,
      origin,
      postLogEvent,
      toggleBookmark,
      toggleDownvote,
      toggleUpvote,
    ],
  );
};
