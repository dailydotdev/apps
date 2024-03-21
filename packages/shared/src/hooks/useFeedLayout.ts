import { useMemo } from 'react';
import { SharedFeedPage } from '../components/utilities';
import { useActiveFeedContext } from '../contexts';
import { AllFeedPages } from '../lib/query';
import { useViewSize, ViewSize } from './useViewSize';

interface UseFeedLayoutProps {
  feedName?: AllFeedPages;
  feedRelated?: boolean;
}

interface UseFeedLayout {
  shouldUseMobileFeedLayout: boolean;
}

export const FeedLayoutMobileFeedPages = new Set(
  Object.values(SharedFeedPage).filter(
    (feedPage) => feedPage !== SharedFeedPage.Search,
  ),
);

const checkShouldUseMobileFeedLayout = (feedName: SharedFeedPage): boolean =>
  FeedLayoutMobileFeedPages.has(feedName) && feedName !== SharedFeedPage.Search;

export const useFeedLayout = ({
  feedName: feedNameProp,
  feedRelated = true,
}: UseFeedLayoutProps = {}): UseFeedLayout => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { feedName } = useActiveFeedContext();
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
