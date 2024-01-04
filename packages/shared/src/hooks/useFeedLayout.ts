import { useMemo } from 'react';
import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { FeedLayout } from '../lib/featureValues';
import { SharedFeedPage } from '../components/utilities';
import { useActiveFeedContext } from '../contexts';
import { AllFeedPages } from '../lib/query';

interface UseFeedLayoutProps {
  feedName?: AllFeedPages;
}

interface UseFeedLayout {
  shouldUseFeedLayoutV1: boolean;
}

export const useFeedLayout = ({
  feedName: feedNameProp,
}: UseFeedLayoutProps = {}): UseFeedLayout => {
  const { feedName } = useActiveFeedContext();
  const feedLayoutVersion = useFeature(feature.feedLayout);
  const isV1 = feedLayoutVersion === FeedLayout.V1;
  const isIncludedFeed = useMemo(() => {
    return Object.values(SharedFeedPage)
      .filter((feedPage) => feedPage !== SharedFeedPage.Search)
      .includes((feedNameProp ?? feedName) as SharedFeedPage);
  }, [feedName, feedNameProp]);
  const shouldUseFeedLayoutV1 = isV1 && isIncludedFeed;

  return {
    shouldUseFeedLayoutV1,
  };
};
