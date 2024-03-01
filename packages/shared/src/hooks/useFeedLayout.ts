import { useMemo } from 'react';
import { SharedFeedPage } from '../components/utilities';
import { AllFeedPages } from '../lib/query';
import { useActiveFeedNameContext } from '../contexts';
import { useViewSize, ViewSize } from './useViewSize';

interface UseFeedLayoutProps {
  feedName?: AllFeedPages;
  feedRelated?: boolean;
}

interface UseFeedLayout {
  shouldUseMobileFeedLayout: boolean;
}

export const FeedLayoutListFeedPages = new Set(
  Object.values(SharedFeedPage).filter(
    (feedPage) => feedPage !== SharedFeedPage.Search,
  ),
);

const checkShouldUseMobileFeedLayout = (feedName: SharedFeedPage): boolean =>
  FeedLayoutListFeedPages.has(feedName) && feedName !== SharedFeedPage.Search;

export const useFeedLayout = ({
  feedName: feedNameProp,
  feedRelated = true,
}: UseFeedLayoutProps = {}): UseFeedLayout => {
  const { feedName } = useActiveFeedNameContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const name = (feedNameProp ?? feedName) as SharedFeedPage;
  const isIncludedFeed = useMemo(
    () => checkShouldUseMobileFeedLayout(name),
    [name],
  );
  const shouldUseMobileFeedLayout = !feedRelated
    ? isMobile
    : isMobile && isIncludedFeed;

  return {
    shouldUseMobileFeedLayout,
  };
};
