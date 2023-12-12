import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { FeedLayout } from '../lib/featureValues';

interface UseFeedLayoutProps {
  feedName: string;
}

// TODO: return type to be changed once more info is added to the return object
export const useFeedLayout = ({
  feedName,
}: UseFeedLayoutProps): Record<string, unknown> => {
  const feedLayoutVersion = useFeature(feature.feedLayout);
  const isFeedLayoutVersion = feedLayoutVersion === FeedLayout.V1;
  const shouldUseFeedLayout = isFeedLayoutVersion && feedName !== 'squad';

  if (shouldUseFeedLayout) {
    return {
      // the values of the object can also be specific to
      // certain components and pages and can be separated in the return
    };
  }
  return {};
};
