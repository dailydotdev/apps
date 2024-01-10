import { useMemo } from 'react';
import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { FeedLayout } from '../lib/featureValues';
import { SharedFeedPage } from '../components/utilities';
import { AllFeedPages } from '../lib/query';
import { useActiveFeedNameContext } from '../contexts';

interface UseFeedLayoutProps {
  feedName?: AllFeedPages;
}

interface UseFeedLayout {
  shouldUseFeedLayoutV1: boolean;
}

const checkShouldUseFeedLayoutV1 = (feedName: SharedFeedPage): boolean =>
  Object.values(SharedFeedPage)
    .filter((feedPage) => feedPage !== SharedFeedPage.Search)
    .includes(feedName) && feedName !== SharedFeedPage.Search;

export const useFeedLayout = ({
  feedName: feedNameProp,
}: UseFeedLayoutProps = {}): UseFeedLayout => {
  const { feedName } = useActiveFeedNameContext();
  const name = (feedNameProp ?? feedName) as SharedFeedPage;
  const feedLayoutVersion = useFeature(feature.feedLayout);
  const isV1 = feedLayoutVersion === FeedLayout.V1;
  const isIncludedFeed = useMemo(
    () => checkShouldUseFeedLayoutV1(name),
    [name],
  );
  const shouldUseFeedLayoutV1 = isV1 && isIncludedFeed;

  return {
    shouldUseFeedLayoutV1,
  };
};
