import { useViewSize, ViewSize } from './useViewSize';

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
  const isMobile = useViewSize(ViewSize.MobileL);

  return {
    shouldUseMobileFeedLayout: isMobile,
  };
};
