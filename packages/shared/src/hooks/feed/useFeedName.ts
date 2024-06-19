import { SharedFeedPage } from '../../components/utilities';
import { AllFeedPages, OtherFeedPage } from '../../lib/query';

interface UseFeedNameProps {
  feedName: AllFeedPages;
}

interface UseFeedName {
  isUpvoted: boolean;
  isPopular: boolean;
  isAnyExplore: boolean;
  isExplorePopular: boolean;
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
    isAnyExplore: feedName?.startsWith(OtherFeedPage.Explore),
    isExplorePopular: feedName === OtherFeedPage.Explore,
    isExploreLatest: feedName === OtherFeedPage.ExploreLatest,
    isExploreUpvoted: feedName === OtherFeedPage.ExploreUpvoted,
    isExploreDiscussed: feedName === OtherFeedPage.ExploreDiscussed,
    isDiscussed: feedName === SharedFeedPage.Discussed,
    isCustomFeed: customFeeds.includes(feedName),
    isSortableFeed: sortableFeeds.includes(feedName),
  };
};
