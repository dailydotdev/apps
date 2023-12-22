import { useContext } from 'react';
import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { FeedLayout } from '../lib/featureValues';
import { SharedFeedPage } from '../components/utilities';
import { AllFeedPages } from '../lib/query';
import { ActiveFeedNameContext } from '../contexts';

interface UseFeedLayoutProps {
  feedName?: AllFeedPages;
  feedRelated?: boolean;
}

interface UseFeedLayout {
  shouldUseFeedLayoutV1: boolean;
}

export const useFeedLayout = ({
  feedName: feedNameProp,
}: UseFeedLayoutProps = {}): UseFeedLayout => {
  const { feedName } = useContext(ActiveFeedNameContext);

  const feedLayoutVersion = useFeature(feature.feedLayout);
  const isV1 = feedLayoutVersion === FeedLayout.V1;
  const isIncludedFeed = Object.values(SharedFeedPage)
    .filter((feedPage) => feedPage !== SharedFeedPage.Search)
    .includes((feedNameProp ?? feedName) as SharedFeedPage);
  const shouldUseFeedLayoutV1 = isV1 && isIncludedFeed;

  return {
    shouldUseFeedLayoutV1,
  };
};
