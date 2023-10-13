import { useContext, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import useIncrementReadingRank from './useIncrementReadingRank';
import AnalyticsContext from '../contexts/AnalyticsContext';
import {
  feedAnalyticsExtra,
  optimisticPostUpdateInFeed,
  postAnalyticsEvent,
} from '../lib/feed';
import { Post, PostType } from '../graphql/posts';
import { Origin } from '../lib/analytics';
import { ActiveFeedContext, useActiveFeedContext } from '../contexts';
import { updateCachedPagePost } from '../lib/query';
import { usePostFeedback } from './usePostFeedback';

interface PostClickOptionalProps {
  skipPostUpdate?: boolean;
  parent_id?: string;
}

export type FeedPostClick = ({
  post,
  row,
  column,
  optional,
}: {
  post: Post;
  row?: number;
  column?: number;
  optional?: PostClickOptionalProps;
}) => Promise<void>;

interface UseOnPostClickProps {
  eventName?: string;
  columns?: number;
  feedName?: string;
  ranking?: string;
  origin?: Origin;
}
export default function useOnPostClick({
  eventName = 'go to link',
  columns,
  feedName,
  ranking,
  origin,
}: UseOnPostClickProps): FeedPostClick {
  const client = useQueryClient();
  const { trackEvent } = useContext(AnalyticsContext);
  const { incrementReadingRank } = useIncrementReadingRank();
  const { items } = useActiveFeedContext();
  const { isFeedbackEnabled } = usePostFeedback();
  const feedQueryKey = ['as'];

  return useMemo(
    () =>
      async ({ post, row, column, optional }): Promise<void> => {
        trackEvent(
          postAnalyticsEvent(eventName, post, {
            columns,
            column,
            row,
            extra: {
              ...feedAnalyticsExtra(
                feedName,
                ranking,
                null,
                origin,
                null,
                optional?.parent_id,
              ).extra,
              feedback:
                isFeedbackEnabled && post.type === PostType.Article
                  ? true
                  : undefined,
            },
          }),
        );

        if (optional?.skipPostUpdate) {
          return;
        }

        if (!post.read) {
          await incrementReadingRank();
        }

        if (eventName === 'go to link' && feedQueryKey) {
          const mutationHandler = () => {
            return {
              read: true,
            };
          };
          const updateFeedPost = updateCachedPagePost(feedQueryKey, client);
          const updateFeedPostCache = optimisticPostUpdateInFeed(
            items,
            updateFeedPost,
            mutationHandler,
          );
          const postIndex = items.findIndex(
            (item) => item.type === 'post' && item.post.id === post.id,
          );

          if (postIndex === -1) {
            return;
          }

          updateFeedPostCache({ index: postIndex });
        }
      },
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns, feedName, ranking, origin, isFeedbackEnabled],
  );
}
