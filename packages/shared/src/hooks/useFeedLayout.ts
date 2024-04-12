import { useViewSize, ViewSize } from './useViewSize';
import { useActiveFeedNameContext } from '../contexts/ActiveFeedNameContext';
import { OtherFeedPage } from '../lib/query';

interface UseFeedLayout {
  shouldUseMobileFeedLayout: boolean;
}

export enum FeedPagesWithMobileLayout {
  MyFeed = 'my-feed',
  Popular = 'popular',
  Search = 'search',
  Upvoted = 'upvoted',
  Discussed = 'discussed',
  Bookmarks = 'bookmarks',
}

export const FeedLayoutMobileFeedPages = new Set(
  Object.values(FeedPagesWithMobileLayout),
);

export const useFeedLayout = (): UseFeedLayout => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { feedName } = useActiveFeedNameContext();

  return {
    shouldUseMobileFeedLayout:
      !isLaptop ||
      feedName === OtherFeedPage.UserPosts ||
      feedName === OtherFeedPage.UserUpvoted,
  };
};
