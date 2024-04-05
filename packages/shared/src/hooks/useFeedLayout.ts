import { useMemo } from 'react';
import { SharedFeedPage } from '../components/utilities';
import { AllFeedPages } from '../lib/query';
import { useActiveFeedNameContext } from '../contexts/ActiveFeedNameContext';
import { useViewSize, ViewSize } from './useViewSize';

interface UseFeedLayoutProps {
  feedName?: AllFeedPages;
  feedRelated?: boolean;
}

interface UseFeedLayout {
  shouldUseMobileFeedLayout: boolean;
  shouldOpenPostModal: boolean;
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
  const { feedName } = useActiveFeedNameContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const name = (feedNameProp ?? feedName) as SharedFeedPage;
  const isIncludedFeed = useMemo(
    () => checkShouldUseMobileFeedLayout(name),
    [name],
  );

  const isNotLaptopAndIsIncludedFeed = !isLaptop && isIncludedFeed;
  const shouldUseMobileFeedLayout = feedRelated
    ? isNotLaptopAndIsIncludedFeed
    : !isLaptop;

  return {
    shouldUseMobileFeedLayout,
    shouldOpenPostModal: isLaptop,
  };
};
