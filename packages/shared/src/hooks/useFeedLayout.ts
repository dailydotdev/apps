import { useMemo } from 'react';
import { SharedFeedPage } from '../components/utilities';
import { useActiveFeedContext } from '../contexts';
import { AllFeedPages } from '../lib/query';
import { useFeatureFeedLayoutV1 } from './useFeatureFeedLayoutV1';

interface UseFeedLayoutProps {
  feedName?: AllFeedPages;
}

interface UseFeedLayout {
  shouldUseFeedLayoutV1: boolean;
}

export const FeedLayoutV1FeedPages = new Set(
  Object.values(SharedFeedPage).filter(
    (feedPage) => feedPage !== SharedFeedPage.Search,
  ),
);

const checkShouldUseFeedLayoutV1 = (feedName: SharedFeedPage): boolean =>
  FeedLayoutV1FeedPages.has(feedName) && feedName !== SharedFeedPage.Search;

export const useFeedLayout = ({
  feedName: feedNameProp,
}: UseFeedLayoutProps = {}): UseFeedLayout => {
  const { feedName } = useActiveFeedContext();
  const name = (feedNameProp ?? feedName) as SharedFeedPage;
  const isV1 = useFeatureFeedLayoutV1();
  const isIncludedFeed = useMemo(
    () => checkShouldUseFeedLayoutV1(name),
    [name],
  );
  const shouldUseFeedLayoutV1 = isV1 && isIncludedFeed;

  return {
    shouldUseFeedLayoutV1,
  };
};
