import { useContext } from 'react';
import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { FeedLayout } from '../lib/featureValues';
import { SharedFeedPage } from '../components/utilities';
import { ActiveFeedContext } from '../contexts';
import { AllFeedPages } from '../lib/query';

interface UseFeedLayoutProps {
  feedName?: AllFeedPages;
  feedRelated?: boolean;
}

interface UseFeedLayout {
  shouldUseFeedLayoutV1: boolean;
}

export const useFeedLayout = ({
  feedName: feedNameProp,
  feedRelated = true,
}: UseFeedLayoutProps = {}): UseFeedLayout => {
  const { feedName } = useContext(ActiveFeedContext);

  const feedLayoutVersion = useFeature(feature.feedLayout);
  const isV1 = feedLayoutVersion === FeedLayout.V1;
  const isIncludedFeed = Object.values(SharedFeedPage).includes(
    (feedNameProp ?? feedName) as SharedFeedPage,
  );
  const shouldUseFeedLayoutV1 = isV1 && (!feedRelated || isIncludedFeed);

  return {
    shouldUseFeedLayoutV1,
  };
};
