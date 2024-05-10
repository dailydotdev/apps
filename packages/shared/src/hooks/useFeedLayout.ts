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
import { useConditionalFeature } from './useConditionalFeature';
import { feature } from '../lib/featureManagement';
import { FeedListLayoutExperiment } from '../lib/featureValues';

interface UseFeedLayoutReturn {
  shouldUseListFeedLayout: boolean;
  FeedPageLayoutComponent: React.ComponentType<
    React.HTMLAttributes<HTMLDivElement>
  >;
  screenCenteredOnMobileLayout?: boolean;
  shouldUseCommentFeedLayout: boolean;
  isListModeV1: boolean;
  shouldUseListModeV1: boolean;
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

const getFeedPageLayoutComponent = ({
  shouldUseListFeedLayout,
  shouldUseCommentFeedLayout,
  shouldUseListModeV1,
}: Pick<
  UseFeedLayoutReturn,
  | 'shouldUseListFeedLayout'
  | 'shouldUseCommentFeedLayout'
  | 'shouldUseListModeV1'
>): UseFeedLayoutReturn['FeedPageLayoutComponent'] => {
  if (shouldUseCommentFeedLayout) {
    return CommentFeedPage;
  }

  if (shouldUseListModeV1) {
    return FeedPageLayoutList;
  }

  if (shouldUseListFeedLayout) {
    return FeedPageLayoutMobile;
  }

  return FeedPage;
};

export const useFeedLayout = ({
  feedRelated = true,
}: UseFeedLayoutProps = {}): UseFeedLayoutReturn => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { feedName } = useActiveFeedNameContext();
  const { insaneMode: listMode } = useContext(SettingsContext);
  const { value: feedListLayoutExperiment } = useConditionalFeature({
    feature: feature.feedListLayout,
    shouldEvaluate: listMode,
  });

  const isListModeV1 =
    feedListLayoutExperiment === FeedListLayoutExperiment.V1 && listMode;

  const shouldUseListFeedLayoutOnProfilePages = UserProfileFeedPages.has(
    feedName as UserProfileFeedType,
  );

  const isFeedIncludedInListLayout = FeedLayoutMobileFeedPages.has(
    feedName as FeedPagesWithMobileLayoutType,
  );

  const shouldUseListFeedLayoutOnMobileTablet =
    !isLaptop && isFeedIncludedInListLayout;

  const shouldUseListModeV1 =
    isListModeV1 && isLaptop && isFeedIncludedInListLayout;

  const shouldUseListFeedLayout = feedRelated
    ? shouldUseListFeedLayoutOnMobileTablet ||
      shouldUseListFeedLayoutOnProfilePages ||
      shouldUseListModeV1
    : isListModeV1 || !isLaptop;

  const shouldUseCommentFeedLayout = feedName === SharedFeedPage.Discussed;

  const FeedPageLayoutComponent = getFeedPageLayoutComponent({
    shouldUseListModeV1,
    shouldUseListFeedLayout,
    shouldUseCommentFeedLayout,
  });

  return {
    shouldUseListFeedLayout,
    shouldUseCommentFeedLayout,
    FeedPageLayoutComponent,
    isListModeV1,
    shouldUseListModeV1,
    screenCenteredOnMobileLayout:
      shouldUseListFeedLayoutOnMobileTablet &&
      !UserProfileFeedPages.has(feedName as UserProfileFeedType),
  };
};
