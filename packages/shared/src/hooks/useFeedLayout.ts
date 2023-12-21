import { useContext } from 'react';
import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { FeedLayout } from '../lib/featureValues';
import { SharedFeedPage } from '../components/utilities';
import { AllFeedPages } from '../lib/query';
import { ActiveFeedNameContext } from '../contexts/ActiveFeedNameContext';

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
  const { feedName } = useContext(ActiveFeedNameContext);
  console.log('feedName', feedName);

  const feedLayoutVersion = useFeature(feature.feedLayout);
  const isV1 = true;
  const isIncludedFeed = feedRelated
    ? Object.values(SharedFeedPage)
        .filter((feedPage) => feedPage !== SharedFeedPage.Search)
        .includes((feedNameProp ?? feedName) as SharedFeedPage)
    : !feedRelated;
  const shouldUseFeedLayoutV1 = isV1 && isIncludedFeed;

  return {
    shouldUseFeedLayoutV1,
  };
};
