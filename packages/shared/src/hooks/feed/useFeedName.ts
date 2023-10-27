import { SharedFeedPage } from '../../components/utilities';
import { useFeature } from '../../components/GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { SearchExperiment } from '../../lib/featureValues';

interface UseFeedNameProps {
  isSearchOn: boolean;
  feedName: SharedFeedPage;
}

interface UseFeedName {
  isUpvoted: boolean;
  isSortableFeed: boolean;
}

const sortableFeeds = [SharedFeedPage.Popular, SharedFeedPage.MyFeed];

export const useFeedName = ({
  feedName,
  isSearchOn,
}: UseFeedNameProps): UseFeedName => {
  const searchVersion = useFeature(feature.search);

  return {
    isUpvoted:
      searchVersion === SearchExperiment.Control
        ? !isSearchOn && feedName === 'upvoted'
        : feedName === 'upvoted',
    isSortableFeed:
      searchVersion === SearchExperiment.Control
        ? !isSearchOn && sortableFeeds.includes(feedName)
        : sortableFeeds.includes(feedName),
  };
};
