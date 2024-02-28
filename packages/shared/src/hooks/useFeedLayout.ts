import { useMemo } from 'react';
import { SharedFeedPage } from '../components/utilities';
import { AllFeedPages } from '../lib/query';
import { useActiveFeedNameContext } from '../contexts';
import { useViewSize, ViewSize } from './useViewSize';

interface UseFeedLayoutProps {
  feedName?: AllFeedPages;
}

interface UseListFeedLayout {
  shouldUseListFeedLayout: boolean;
}

export const FeedLayoutListFeedPages = new Set(
  Object.values(SharedFeedPage).filter(
    (feedPage) => feedPage !== SharedFeedPage.Search,
  ),
);

const checkShouldUseListFeedLayout = (feedName: SharedFeedPage): boolean =>
  FeedLayoutListFeedPages.has(feedName) && feedName !== SharedFeedPage.Search;

export const useFeedLayout = ({
  feedName: feedNameProp,
}: UseFeedLayoutProps = {}): UseListFeedLayout => {
  const { feedName } = useActiveFeedNameContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const name = (feedNameProp ?? feedName) as SharedFeedPage;
  const isIncludedFeed = useMemo(
    () => checkShouldUseListFeedLayout(name),
    [name],
  );
  const shouldUseListFeedLayout = isMobile && isIncludedFeed;

  return {
    shouldUseListFeedLayout,
  };
};
