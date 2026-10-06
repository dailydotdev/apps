import { SharedFeedPage } from '../../components/utilities';
import type { AllFeedPages } from '../../lib/query';
import { OtherFeedPage } from '../../lib/query';

interface UseFeedNameProps {
  feedName: AllFeedPages;
}

interface UseFeedName {
  isUpvoted: boolean;
  isPopular: boolean;
  isSearch: boolean;
  isAnyExplore: boolean;
  isExplorePopular: boolean;
  isExploreLatest: boolean;
  isExploreUpvoted: boolean;
  isExploreDiscussed: boolean;
  isDiscussed: boolean;
  isExploreHub: boolean;
  isCustomFeed: boolean;
  isSortableFeed: boolean;
}

const sortableFeeds: AllFeedPages[] = [
  SharedFeedPage.Popular,
  SharedFeedPage.MyFeed,
];

const customFeeds: AllFeedPages[] = [
  SharedFeedPage.Custom,
  SharedFeedPage.CustomForm,
];

const explorePages: AllFeedPages[] = [
  OtherFeedPage.Explore,
  OtherFeedPage.ExploreLatest,
  OtherFeedPage.ExploreUpvoted,
  OtherFeedPage.ExploreDiscussed,
];

// The feeds the sidebar's Explore panel leads to: the sort tabs and
// Discussions.
const exploreHubPages: AllFeedPages[] = [
  ...explorePages,
  OtherFeedPage.Discussed,
];

export const useFeedName = ({ feedName }: UseFeedNameProps): UseFeedName => {
  return {
    isUpvoted: feedName === SharedFeedPage.Upvoted,
    isPopular: feedName === SharedFeedPage.Popular,
    isSearch: feedName?.startsWith(SharedFeedPage.Search),
    isAnyExplore: explorePages.includes(feedName),
    isExplorePopular: feedName === OtherFeedPage.Explore,
    isExploreLatest: feedName === OtherFeedPage.ExploreLatest,
    isExploreUpvoted: feedName === OtherFeedPage.ExploreUpvoted,
    isExploreDiscussed: feedName === OtherFeedPage.ExploreDiscussed,
    isDiscussed: feedName === OtherFeedPage.Discussed,
    isExploreHub: exploreHubPages.includes(feedName),
    isCustomFeed: customFeeds.includes(feedName),
    isSortableFeed: sortableFeeds.includes(feedName),
  };
};
