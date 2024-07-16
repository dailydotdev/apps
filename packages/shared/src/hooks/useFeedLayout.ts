import { useContext } from 'react';
import { useViewSize, ViewSize } from './useViewSize';
import { useActiveFeedNameContext } from '../contexts/ActiveFeedNameContext';
import {
  CommentFeedPage,
  FeedPage,
  FeedPageLayoutList,
  FeedPageLayoutMobile,
  SharedFeedPage,
} from '../components/utilities';
import { AllFeedPages, OtherFeedPage } from '../lib/query';
import SettingsContext from '../contexts/SettingsContext';
import { isNullOrUndefined } from '../lib/func';

interface UseFeedLayoutReturn {
  shouldUseListFeedLayout: boolean;
  FeedPageLayoutComponent: React.ComponentType<
    React.HTMLAttributes<HTMLDivElement>
  >;
  screenCenteredOnMobileLayout?: boolean;
  shouldUseCommentFeedLayout: boolean;
  isListMode: boolean;
  shouldUseListMode: boolean;
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
  | 'sources[source]/most-upvoted'
  | 'sources[source]/best-discussed'
  | 'tags[tag]/most-upvoted'
  | 'tags[tag]/best-discussed'
>;

export type UserProfileFeedType = Extract<
  AllFeedPages,
  'user-upvoted' | 'user-posts'
>;

export const FeedLayoutMobileFeedPages = new Set([
  ...Object.values(SharedFeedPage).filter(
    (item) => item !== SharedFeedPage.CustomForm,
  ),
  OtherFeedPage.TagPage,
  OtherFeedPage.SourcePage,
  OtherFeedPage.SquadPage,
  OtherFeedPage.Bookmarks,
  OtherFeedPage.SearchBookmarks,
  OtherFeedPage.UserUpvoted,
  OtherFeedPage.UserPosts,
  OtherFeedPage.Explore,
  OtherFeedPage.ExploreLatest,
  OtherFeedPage.ExploreDiscussed,
  OtherFeedPage.ExploreUpvoted,
  OtherFeedPage.FeedByIds,
  OtherFeedPage.Welcome,
]);

export const UserProfileFeedPages = new Set([
  OtherFeedPage.UserUpvoted,
  OtherFeedPage.UserPosts,
]);

const getFeedPageLayoutComponent = ({
  shouldUseListFeedLayoutOnMobileTablet,
  shouldUseCommentFeedLayout,
  shouldUseListMode,
}: Pick<
  UseFeedLayoutReturn,
  'shouldUseCommentFeedLayout' | 'shouldUseListMode'
> & {
  shouldUseListFeedLayoutOnMobileTablet: boolean;
}): UseFeedLayoutReturn['FeedPageLayoutComponent'] => {
  if (shouldUseCommentFeedLayout) {
    return CommentFeedPage;
  }

  if (shouldUseListMode) {
    return FeedPageLayoutList;
  }

  if (shouldUseListFeedLayoutOnMobileTablet) {
    return FeedPageLayoutMobile;
  }

  return FeedPage;
};

export const useFeedLayout = ({
  feedRelated = true,
}: UseFeedLayoutProps = {}): UseFeedLayoutReturn => {
  const isLaptopSize = useViewSize(ViewSize.Laptop);
  const isLaptop = isNullOrUndefined(isLaptopSize) || isLaptopSize;
  const { feedName } = useActiveFeedNameContext();
  const { insaneMode: isListMode } = useContext(SettingsContext);

  const shouldUseListFeedLayoutOnProfilePages = UserProfileFeedPages.has(
    feedName as UserProfileFeedType,
  );

  const isFeedIncludedInListLayout = FeedLayoutMobileFeedPages.has(
    feedName as FeedPagesWithMobileLayoutType,
  );

  const shouldUseListFeedLayoutOnMobileTablet =
    !isLaptop && isFeedIncludedInListLayout;

  const shouldUseListMode =
    isListMode && isLaptop && isFeedIncludedInListLayout;

  const shouldUseListFeedLayout = feedRelated
    ? shouldUseListFeedLayoutOnMobileTablet ||
      shouldUseListFeedLayoutOnProfilePages ||
      shouldUseListMode
    : isListMode || !isLaptop;

  const shouldUseCommentFeedLayout = feedName === SharedFeedPage.Discussed;

  const FeedPageLayoutComponent = getFeedPageLayoutComponent({
    shouldUseListMode,
    shouldUseListFeedLayoutOnMobileTablet,
    shouldUseCommentFeedLayout,
  });

  return {
    shouldUseListFeedLayout,
    shouldUseCommentFeedLayout,
    FeedPageLayoutComponent,
    isListMode,
    shouldUseListMode,
    screenCenteredOnMobileLayout:
      shouldUseListFeedLayoutOnMobileTablet &&
      !UserProfileFeedPages.has(feedName as UserProfileFeedType),
  };
};
