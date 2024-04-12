import { useViewSize, ViewSize } from './useViewSize';
import { useActiveFeedNameContext } from '../contexts/ActiveFeedNameContext';
import { OtherFeedPage } from '../lib/query';
import { FeedPage, FeedPageLayoutMobile } from '../components/utilities';

interface UseFeedLayout {
  shouldUseMobileFeedLayout: boolean;
  FeedPageLayoutComponent: React.ComponentType;
}

export enum FeedPagesWithMobileLayout {
  MyFeed = 'my-feed',
  Popular = 'popular',
  Search = 'search',
  Upvoted = 'upvoted',
  Discussed = 'discussed',
  Bookmarks = 'bookmarks',
  UserPosts = 'user-posts',
  UserUpvoted = 'user-upvoted',
}

export const FeedLayoutMobileFeedPages = new Set(
  Object.values(FeedPagesWithMobileLayout),
);

export const useFeedLayout = (): UseFeedLayout => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { feedName } = useActiveFeedNameContext();
  const isUserProfileFeed =
    feedName === OtherFeedPage.UserPosts ||
    feedName === OtherFeedPage.UserUpvoted;

  const shouldUseMobileFeedLayout = !isLaptop || isUserProfileFeed;

  const FeedPageLayoutComponent = shouldUseMobileFeedLayout
    ? FeedPageLayoutMobile
    : FeedPage;

  return {
    shouldUseMobileFeedLayout,
    FeedPageLayoutComponent,
  };
};
