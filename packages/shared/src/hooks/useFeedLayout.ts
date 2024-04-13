import { useViewSize, ViewSize } from './useViewSize';
import { useActiveFeedNameContext } from '../contexts/ActiveFeedNameContext';
import { FeedPage, FeedPageLayoutMobile } from '../components/utilities';
import { AllFeedPages } from '../lib/query';

interface UseFeedLayoutReturn {
  shouldUseMobileFeedLayout: boolean;
  FeedPageLayoutComponent: React.ComponentType;
}

interface UseFeedLayoutProps {
  feedRelated?: boolean;
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
  SquadPage = 'squads[handle]',
  TagPage = 'tags[tag]',
  SourcePage = 'sources[source]',
}

export enum UserProfileFeed {
  UserPosts = 'user-posts',
  UserUpvoted = 'user-upvoted',
}

export const FeedLayoutMobileFeedPages = new Set(
  Object.values(FeedPagesWithMobileLayout),
);

export const UserProfileFeedPages = new Set(Object.values(UserProfileFeed));

const checkShouldUseMobileFeedLayout = (
  isLaptop: boolean,
  feedName: AllFeedPages | UserProfileFeed | FeedPagesWithMobileLayout,
): boolean =>
  (!isLaptop &&
    FeedLayoutMobileFeedPages.has(feedName as FeedPagesWithMobileLayout)) ||
  UserProfileFeedPages.has(feedName as UserProfileFeed);

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
  };
};
