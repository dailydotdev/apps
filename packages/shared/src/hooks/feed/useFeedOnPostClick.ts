import { useContext } from 'react';
import { Post } from '../../graphql/posts';
import { logReadArticle } from '../../lib/analytics';
import { FeedItem, PostItem } from '../useFeed';
import OnboardingContext, {
  EngagementAction,
} from '../../contexts/OnboardingContext';
import useIncrementReadingRank from '../useIncrementReadingRank';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../../lib/feed';

export default function useFeedOnPostClick(
  items: FeedItem[],
  updatePost: (page: number, index: number, post: Post) => void,
  columns: number,
): (post: Post, index: number, row: number, column: number) => Promise<void> {
  const { trackEngagement } = useContext(OnboardingContext);
  const { incrementReadingRank } = useIncrementReadingRank();
  const { trackEvent } = useContext(AnalyticsContext);

  return async (post, index, row, column): Promise<void> => {
    trackEvent(
      postAnalyticsEvent('click', post, {
        columns,
        column,
        row,
        extra: { origin: 'feed' },
      }),
    );
    await logReadArticle('feed');
    if (!post.read) {
      incrementReadingRank();
    }
    const item = items[index] as PostItem;
    updatePost(item.page, item.index, { ...post, read: true });
    await trackEngagement(EngagementAction.Post_Click);
  };
}
