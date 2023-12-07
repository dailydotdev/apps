import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { FeedLayout } from '../lib/featureValues';
import { AllFeedPages } from '../lib/query';
import { SharedFeedPage } from '../components/utilities';

interface UseFeedLayoutProps {
  feedName: AllFeedPages;
}

interface UseFeedLayoutReturn {
  isSingleColumnFeedLayout: boolean;
}

// TODO: return type to be changed once more info is added to the return object
export const useFeedLayout = ({
  feedName,
}: UseFeedLayoutProps): UseFeedLayoutReturn => {
  const feedLayoutVersion = useFeature(feature.feedLayout);
  // TODO: this automatically shows the new feed layout? is this the right check to do? check with team
  const isFeedLayoutVersion = feedLayoutVersion === FeedLayout.V1;
  const isIncludedFeed = Object.values(SharedFeedPage).includes(
    feedName as SharedFeedPage,
  );
  const shouldUseFeedLayout = isFeedLayoutVersion && isIncludedFeed;

  if (shouldUseFeedLayout) {
    return {
      isSingleColumnFeedLayout: true,
      // the values of the object can also be specific to
      // certain components and pages and can be separated in the return
    };
  }
  return {
    isSingleColumnFeedLayout: false,
  };
};
