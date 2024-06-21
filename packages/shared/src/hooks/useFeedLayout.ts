import { useContext, ComponentType, HTMLAttributes, useMemo } from 'react';
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
import ProgressiveEnhancementContext from '../contexts/ProgressiveEnhancementContext';

interface UseFeedLayoutReturn {
  isListFeedLayout: boolean;
  shouldBeCentered: boolean;
  FeedPageLayoutComponent: ComponentType<HTMLAttributes<HTMLDivElement>>;
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
]);

export const UserProfileFeedPages = new Set([
  OtherFeedPage.UserUpvoted,
  OtherFeedPage.UserPosts,
]);

export const useFeedLayout = (): UseFeedLayoutReturn => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { feedName } = useActiveFeedNameContext();
  const { insaneMode: isListMode } = useContext(SettingsContext);

  const isListFeedLayoutOnProfilePages = UserProfileFeedPages.has(
    feedName as UserProfileFeedType,
  );

  const isFeedIncludedInListLayout = FeedLayoutMobileFeedPages.has(
    feedName as FeedPagesWithMobileLayoutType,
  );

  const isListFeedLayout =
    isListMode || !isLaptop || isFeedIncludedInListLayout;
  const isListFeedMobile = isListMode && !isLaptop;

  return {
    isListFeedLayout,
    shouldBeCentered: isListFeedMobile && !isListFeedLayoutOnProfilePages,
    FeedPageLayoutComponent: useMemo(() => {
      if (feedName === SharedFeedPage.Discussed) {
        return CommentFeedPage;
      }

      if (isListFeedLayout) {
        return isLaptop ? FeedPageLayoutList : FeedPageLayoutMobile;
      }

      return FeedPage;
    }, [feedName, isLaptop, isListFeedLayout]),
  };
};
