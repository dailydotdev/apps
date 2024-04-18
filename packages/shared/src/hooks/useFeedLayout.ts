import { useViewSize, ViewSize } from './useViewSize';
import { useActiveFeedNameContext } from '../contexts/ActiveFeedNameContext';
import {
  FeedPage,
  FeedPageLayoutMobile,
  SharedFeedPage,
} from '../components/utilities';
import { AllFeedPages, OtherFeedPage } from '../lib/query';

interface UseFeedLayoutReturn {
  shouldUseMobileFeedLayout: boolean;
  FeedPageLayoutComponent: React.ComponentType;
  screenCenteredOnMobileLayout?: boolean;
}

interface UseFeedLayoutProps {
  feedRelated?: boolean;
}

export type FeedPagesWithMobileLayoutType = Exclude<
  AllFeedPages,
  | 'notifications'
  | 'history'
  | 'preview'
  | 'author'
  | 'squads'
  | 'source'
  | 'tag'
>;

export type UserProfileFeedType = Extract<
  AllFeedPages,
  'user-upvoted' | 'user-posts'
>;

export const FeedLayoutMobileFeedPages = new Set([
  ...Object.values(SharedFeedPage),
  OtherFeedPage.TagPage,
  OtherFeedPage.SourcePage,
  OtherFeedPage.SquadPage,
  OtherFeedPage.Bookmarks,
  OtherFeedPage.SearchBookmarks,
  OtherFeedPage.UserUpvoted,
  OtherFeedPage.UserPosts,
]);

export const UserProfileFeedPages = new Set([
  OtherFeedPage.UserUpvoted,
  OtherFeedPage.UserPosts,
]);

const checkShouldUseMobileFeedLayout = (
  isLaptop: boolean,
  feedName: AllFeedPages | FeedPagesWithMobileLayoutType,
): boolean =>
  (!isLaptop &&
    FeedLayoutMobileFeedPages.has(feedName as FeedPagesWithMobileLayoutType)) ||
  UserProfileFeedPages.has(feedName as UserProfileFeedType);

export const useFeedLayout = ({
  feedRelated = true,
}: UseFeedLayoutProps = {}): UseFeedLayoutReturn => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { feedName } = useActiveFeedNameContext();

  const shouldUseMobileFeedLayout = feedRelated
    ? checkShouldUseMobileFeedLayout(isLaptop, feedName)
    : !isLaptop;

  const FeedPageLayoutComponent = shouldUseMobileFeedLayout
    ? FeedPageLayoutMobile
    : FeedPage;

  return {
    shouldUseMobileFeedLayout,
    FeedPageLayoutComponent,
    screenCenteredOnMobileLayout:
      shouldUseMobileFeedLayout &&
      !UserProfileFeedPages.has(feedName as UserProfileFeedType),
  };
};
