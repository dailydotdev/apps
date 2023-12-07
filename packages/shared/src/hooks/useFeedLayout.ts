import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { FeedLayout } from '../lib/featureValues';

interface UseFeedLayoutProps {
  feedName: string;
}

export const useFeedLayout = ({ feedName }: UseFeedLayoutProps) => {
  const feedLayoutVersion = useFeature(feature.feedLayout);
  const isFeedLayoutVersion = feedLayoutVersion === FeedLayout.Control;
  const shouldUseFeedLayout = isFeedLayoutVersion && feedName !== 'squad';

  if (shouldUseFeedLayout) {
    return {
      // the values of the object can also be specific to
      // certain components and pages and can be separated in the return
    };
  }
  return {};
};
