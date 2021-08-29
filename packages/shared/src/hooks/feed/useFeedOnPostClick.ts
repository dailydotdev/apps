import { useContext } from 'react';
import { Post } from '../../graphql/posts';
import { logReadArticle, trackEvent } from '../../lib/analytics';
import { FeedItem, PostItem } from '../useFeed';
import OnboardingContext, {
  EngagementAction,
} from '../../contexts/OnboardingContext';
import useIncrementReadingRank from '../useIncrementReadingRank';

export default function useFeedOnPostClick(
  items: FeedItem[],
  updatePost: (page: number, index: number, post: Post) => void,
): (post: Post, index: number) => Promise<void> {
  const { trackEngagement } = useContext(OnboardingContext);
  const { incrementReadingRank } = useIncrementReadingRank();

  return async (post: Post, index: number): Promise<void> => {
    trackEvent({
      category: 'Post',
      action: 'Click',
      label: 'Feed',
    });
    await logReadArticle('feed');
    if (!post.read) {
      incrementReadingRank();
    }
    const item = items[index] as PostItem;
    updatePost(item.page, item.index, { ...post, read: true });
    await trackEngagement(EngagementAction.Post_Click);
  };
}
