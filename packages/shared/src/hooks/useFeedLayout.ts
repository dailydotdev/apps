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
  isFeedListLayoutEnabled: boolean;
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
  shouldUseListFeedLayoutMobile,
}: Pick<
  UseFeedLayoutReturn,
  'shouldUseListFeedLayout' | 'shouldUseCommentFeedLayout'
> & {
  shouldUseListFeedLayoutMobile: boolean;
}): UseFeedLayoutReturn['FeedPageLayoutComponent'] => {
  if (shouldUseCommentFeedLayout) {
    return CommentFeedPage;
  }

  if (shouldUseListFeedLayoutMobile) {
    return FeedPageLayoutMobile;
  }

  if (shouldUseListFeedLayout) {
    return FeedPageLayoutList;
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
  const isFeedListLayoutEnabled =
    feedListLayoutExperiment === FeedListLayoutExperiment.V1 && listMode;
  const shouldUseListFeedLayoutOnProfilePages = UserProfileFeedPages.has(
    feedName as UserProfileFeedType,
  );
  const isFeedIncludedInListLayout = FeedLayoutMobileFeedPages.has(
    feedName as FeedPagesWithMobileLayoutType,
  );
  const shouldUseListFeedLayoutOnMobile =
    !isLaptop && isFeedIncludedInListLayout;
  const shouldUseListFeedLayoutOnDesktop =
    isFeedListLayoutEnabled && isLaptop && isFeedIncludedInListLayout;
  const shouldUseListFeedLayout = feedRelated
    ? shouldUseListFeedLayoutOnMobile ||
      shouldUseListFeedLayoutOnProfilePages ||
      shouldUseListFeedLayoutOnDesktop
    : isFeedListLayoutEnabled || !isLaptop;
  const shouldUseCommentFeedLayout = feedName === SharedFeedPage.Discussed;

  const FeedPageLayoutComponent = getFeedPageLayoutComponent({
    shouldUseListFeedLayoutMobile: shouldUseListFeedLayoutOnMobile,
    shouldUseListFeedLayout,
    shouldUseCommentFeedLayout,
  });

  return {
    shouldUseListFeedLayout,
    shouldUseCommentFeedLayout,
    FeedPageLayoutComponent,
    isFeedListLayoutEnabled: shouldUseListFeedLayoutOnDesktop,
    screenCenteredOnMobileLayout:
      shouldUseListFeedLayoutOnMobile &&
      !UserProfileFeedPages.has(feedName as UserProfileFeedType),
  };
};
