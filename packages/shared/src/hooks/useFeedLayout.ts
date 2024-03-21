import { useMemo } from 'react';
import { SharedFeedPage } from '../components/utilities';
import { AllFeedPages, OtherFeedPage } from '../lib/query';
import { useActiveFeedNameContext } from '../contexts';
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
  const { feedName } = useActiveFeedNameContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const name = feedNameProp ?? feedName;
  const isIncludedFeed = useMemo(
    () =>
      checkShouldUseMobileFeedLayout(name as SharedFeedPage) ||
      name === OtherFeedPage.Squad, // actual squad feed page has a different feed name
    [name],
  );
  const shouldUseMobileFeedLayout = !feedRelated
    ? isMobile
    : isMobile && isIncludedFeed;

  return {
    shouldUseMobileFeedLayout,
  };
};
