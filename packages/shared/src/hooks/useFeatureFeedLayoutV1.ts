import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { FeedLayout } from '../lib/featureValues';

export const useFeatureFeedLayoutV1 = (): boolean => {
  const feedLayoutVersion = useFeature(feature.feedLayout);
  return feedLayoutVersion === FeedLayout.V1;
};
