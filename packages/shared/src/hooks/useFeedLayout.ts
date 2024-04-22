import { useContext } from 'react';
import { useViewSize, ViewSize } from './useViewSize';
import { useActiveFeedNameContext } from '../contexts/ActiveFeedNameContext';
import {
  FeedPage,
  FeedPageLayoutMobile,
  SharedFeedPage,
} from '../components/utilities';
import { AllFeedPages, OtherFeedPage } from '../lib/query';
import { ActiveFeedContext } from '../contexts/ActiveFeedContext';

interface UseFeedLayoutReturn {
  shouldUseMobileFeedLayout: boolean;
  FeedPageLayoutComponent: React.ComponentType<
    React.HTMLAttributes<HTMLDivElement>
  >;
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

const ForceDesktopFeedType = new Set([OtherFeedPage.SourceMostUpvoted]);

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
  const { feedName: originFeedName } = useContext(ActiveFeedContext);
  const evaluateFeedName = ForceDesktopFeedType.has(
    originFeedName as OtherFeedPage,
  )
    ? originFeedName
    : feedName;
  const shouldUseMobileFeedLayout = feedRelated
    ? checkShouldUseMobileFeedLayout(isLaptop, evaluateFeedName)
    : !isLaptop;

  const FeedPageLayoutComponent = shouldUseMobileFeedLayout
    ? FeedPageLayoutMobile
    : FeedPage;

  return {
    shouldUseMobileFeedLayout,
    FeedPageLayoutComponent,
    screenCenteredOnMobileLayout:
      shouldUseMobileFeedLayout &&
      !UserProfileFeedPages.has(evaluateFeedName as UserProfileFeedType),
  };
};
