import { SharedFeedPage } from '../../components/utilities';
import { AllFeedPages } from '../../lib/query';

interface UseFeedNameProps {
  feedName: AllFeedPages;
}

interface UseFeedName {
  isUpvoted: boolean;
  isPopular: boolean;
  isDiscussed: boolean;
  isCustomFeed: boolean;
  isSortableFeed: boolean;
}

const sortableFeeds: AllFeedPages[] = [
  SharedFeedPage.Popular,
  SharedFeedPage.MyFeed,
];

export const useFeedName = ({ feedName }: UseFeedNameProps): UseFeedName => {
  return {
    isUpvoted: feedName === SharedFeedPage.Upvoted,
    isPopular: feedName === SharedFeedPage.Popular,
    isDiscussed: feedName === SharedFeedPage.Discussed,
    isCustomFeed: feedName === SharedFeedPage.Custom,
    isSortableFeed: sortableFeeds.includes(feedName),
  };
};
