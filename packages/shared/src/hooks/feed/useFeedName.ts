import { SharedFeedPage } from '../../components/utilities';

interface UseFeedNameProps {
  feedName: SharedFeedPage;
}

interface UseFeedName {
  isUpvoted: boolean;
  isPopular: boolean;
  isDiscussed: boolean;
  isSortableFeed: boolean;
}

const sortableFeeds = [SharedFeedPage.Popular, SharedFeedPage.MyFeed];

export const useFeedName = ({ feedName }: UseFeedNameProps): UseFeedName => {
  return {
    isUpvoted: feedName === SharedFeedPage.Upvoted,
    isPopular: feedName === SharedFeedPage.Popular,
    isDiscussed: feedName === SharedFeedPage.Discussed,
    isSortableFeed: sortableFeeds.includes(feedName),
  };
};
