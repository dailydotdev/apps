import { SharedFeedPage } from '../../components/utilities';

interface UseFeedNameProps {
  feedName: SharedFeedPage;
}

interface UseFeedName {
  isUpvoted: boolean;
  isSortableFeed: boolean;
}

const sortableFeeds = [SharedFeedPage.Popular, SharedFeedPage.MyFeed];

export const useFeedName = ({ feedName }: UseFeedNameProps): UseFeedName => {
  return {
    isUpvoted: feedName === 'upvoted',
    isSortableFeed: sortableFeeds.includes(feedName),
  };
};
