import { SharedFeedPage } from '../../components/utilities';
import { AllFeedPages } from '../../lib/query';

interface UseFeedNameProps {
  feedName: AllFeedPages;
}

interface UseFeedName {
  isUpvoted: boolean;
  isPopular: boolean;
  isExplore: boolean;
  isExploreLatest: boolean;
  isExploreUpvoted: boolean;
  isExploreDiscussed: boolean;
  isDiscussed: boolean;
  isCustomFeed: boolean;
  isSortableFeed: boolean;
}

const sortableFeeds: AllFeedPages[] = [
  SharedFeedPage.Popular,
  SharedFeedPage.MyFeed,
];

const customFeeds: string[] = [
  SharedFeedPage.Custom,
  SharedFeedPage.CustomForm,
];

export const useFeedName = ({ feedName }: UseFeedNameProps): UseFeedName => {
  return {
    isUpvoted: feedName === SharedFeedPage.Upvoted,
    isPopular: feedName === SharedFeedPage.Popular,
    isExplore: feedName?.startsWith(SharedFeedPage.Explore),
    isExploreLatest: feedName === SharedFeedPage.ExploreLatest,
    isExploreUpvoted: feedName === SharedFeedPage.ExploreUpvoted,
    isExploreDiscussed: feedName === SharedFeedPage.ExploreDiscussed,
    isDiscussed: feedName === SharedFeedPage.Discussed,
    isCustomFeed: customFeeds.includes(feedName),
    isSortableFeed: sortableFeeds.includes(feedName),
  };
};
