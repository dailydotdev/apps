import { useContext, useMemo } from 'react';
import useIncrementReadingRank from './useIncrementReadingRank';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { feedAnalyticsExtra, postAnalyticsEvent } from '../lib/feed';
import { Post } from '../graphql/posts';
import { Origin } from '../lib/analytics';

interface PostClickOptionalProps {
  skipPostUpdate?: boolean;
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
  columns?: number;
  feedName?: string;
  ranking?: string;
  origin?: Origin;
}
export default function useOnPostClick({
  columns,
  feedName,
  ranking,
  origin,
}: UseOnPostClickProps): FeedPostClick {
  const { trackEvent } = useContext(AnalyticsContext);
  const { incrementReadingRank } = useIncrementReadingRank();

  return useMemo(
    () =>
      async ({ post, row, column, optional }): Promise<void> => {
        trackEvent(
          postAnalyticsEvent('go to link', post, {
            columns,
            column,
            row,
            ...feedAnalyticsExtra(feedName, ranking, null, origin),
          }),
        );

        if (optional?.skipPostUpdate) {
          return;
        }

        if (!post.read) {
          await incrementReadingRank();
        }
      },
    [columns, feedName, ranking, origin],
  );
}
