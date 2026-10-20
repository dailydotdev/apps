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
 * The handlers the hero's cards take, logged under `Origin.FeedHero`. Vote
 * and bookmark patch the hero's own query: the bare hooks only write the
 * single-post key, which these cards never read.
 */
export const useFeedHeroCardProps = ({
  queryKey,
  feedName,
}: {
  queryKey: QueryKey;
  feedName: string;
}): Omit<FeaturedWideCardProps, 'post'> => {
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const [, copyLink] = useCopyLink();
  const { toggleUpvote, toggleDownvote, toggleBookmark } =
    useFeedHeroPostActions({
      queryKey,
      feedName,
      origin: Origin.FeedHero,
    });

  return useMemo(
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
      onCopyLinkClick: (_: MouseEvent, post: Post) =>
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
};
