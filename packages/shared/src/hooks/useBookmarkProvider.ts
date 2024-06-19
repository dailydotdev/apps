import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { useActiveFeedNameContext } from '../contexts';
import { SharedFeedPage } from '../components/utilities';

interface UseBookmarkProviderReturn {
  highlightBookmarkedPost: boolean;
}

interface UseBookmarkProviderProps {
  bookmarked?: boolean;
}

const useBookmarkProvider = ({
  bookmarked = false,
}: UseBookmarkProviderProps): UseBookmarkProviderReturn => {
  const bookmarkProvider = useFeature(feature.bookmark_provider);
  const { feedName } = useActiveFeedNameContext();

  return {
    highlightBookmarkedPost:
      bookmarkProvider && feedName === SharedFeedPage.MyFeed && bookmarked,
  };
};

export default useBookmarkProvider;
