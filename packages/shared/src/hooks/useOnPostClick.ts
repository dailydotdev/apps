import { useContext } from 'react';
import useIncrementReadingRank from './useIncrementReadingRank';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { feedAnalyticsExtra, postAnalyticsEvent } from '../lib/feed';
import { Post } from '../graphql/posts';
import { Origin } from '../lib/analytics';

interface PostClickOptionalProps {
  skipPostUpdate?: boolean;
}

export type FeedPostClick = ({
  event,
  post,
  row,
  column,
  optional,
}: {
  event?: string;
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

  return async ({
    event = 'go to link',
    post,
    row,
    column,
    optional,
  }): Promise<void> => {
    trackEvent(
      postAnalyticsEvent(event, post, {
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
  };
}
