import { useContext } from 'react';
import { useMedia } from './useMedia';
import { useActiveFeedNameContext } from '../contexts/ActiveFeedNameContext';
import {
  CommentFeedPage,
  FeedPage,
  FeedPageLayoutList,
  FeedPageLayoutMobile,
  SharedFeedPage,
} from '../components/utilities';
import type { AllFeedPages } from '../lib/query';
import { OtherFeedPage } from '../lib/query';
import SettingsContext from '../contexts/SettingsContext';
import { isNullOrUndefined } from '../lib/func';
import { useSearchResultsLayout } from './search/useSearchResultsLayout';
import { laptop } from '../styles/media';

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

export const FeedLayoutMobileFeedPages = new Set<AllFeedPages>([
  ...Object.values(SharedFeedPage).filter(
    (item) => item !== SharedFeedPage.CustomForm,
  ),
  OtherFeedPage.TagPage,
  OtherFeedPage.SourcePage,
  OtherFeedPage.SquadPage,
  OtherFeedPage.Squads,
  OtherFeedPage.Bookmarks,
  OtherFeedPage.BookmarkLater,
  OtherFeedPage.BookmarkFolder,
  OtherFeedPage.SearchBookmarks,
  OtherFeedPage.UserUpvoted,
  OtherFeedPage.UserPosts,
  OtherFeedPage.Explore,
  OtherFeedPage.ExploreLatest,
  OtherFeedPage.ExploreDiscussed,
  OtherFeedPage.ExploreUpvoted,
  OtherFeedPage.FeedByIds,
  OtherFeedPage.Welcome,
  OtherFeedPage.Following,
  OtherFeedPage.AgentsVibes,
]);

export const UserProfileFeedPages = new Set([
  OtherFeedPage.UserUpvoted,
  OtherFeedPage.UserPosts,
]);

export const PostFeedPages = new Set([
  OtherFeedPage.Post,
  OtherFeedPage.AgentsVibes,
]);

interface GetFeedPageLayoutComponentProps
  extends Pick<
    UseFeedLayoutReturn,
    'shouldUseCommentFeedLayout' | 'shouldUseListMode'
  > {
  shouldUseListFeedLayoutOnMobileTablet: boolean;
  isSearchPageLaptop: boolean;
}

const getFeedPageLayoutComponent = ({
  shouldUseListFeedLayoutOnMobileTablet,
  shouldUseCommentFeedLayout,
  shouldUseListMode,
  isSearchPageLaptop,
}: GetFeedPageLayoutComponentProps): UseFeedLayoutReturn['FeedPageLayoutComponent'] => {
  if (shouldUseCommentFeedLayout) {
    return CommentFeedPage;
  }

  if (shouldUseListMode && !isSearchPageLaptop) {
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
  const isLaptopSize = useMedia(
    [laptop.replace('@media ', '')],
    [true],
    false,
    undefined,
  );
  const isLaptop = isNullOrUndefined(isLaptopSize) || isLaptopSize;
  const { feedName } = useActiveFeedNameContext();
  const { insaneMode } = useContext(SettingsContext);
  const { isSearchPageLaptop } = useSearchResultsLayout();

  const isPostFeedPage = PostFeedPages.has(feedName as OtherFeedPage);

  const isListMode = isSearchPageLaptop || insaneMode;

  const shouldUseListFeedLayoutOnProfilePages = UserProfileFeedPages.has(
    feedName as UserProfileFeedType,
  );

  const isFeedIncludedInListLayout = FeedLayoutMobileFeedPages.has(feedName);

  const shouldUseListFeedLayoutOnMobileTablet =
    !isLaptop && isFeedIncludedInListLayout;

  const shouldUseListMode =
    (isListMode && isLaptop && isFeedIncludedInListLayout) || isPostFeedPage;

  const shouldUseListFeedLayout = feedRelated
    ? shouldUseListFeedLayoutOnMobileTablet ||
      shouldUseListFeedLayoutOnProfilePages ||
      shouldUseListMode
    : isListMode || !isLaptop;

  const shouldUseCommentFeedLayout = feedName === OtherFeedPage.Discussed;

  const FeedPageLayoutComponent = getFeedPageLayoutComponent({
    shouldUseListMode,
    shouldUseListFeedLayoutOnMobileTablet,
    shouldUseCommentFeedLayout,
    isSearchPageLaptop,
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
