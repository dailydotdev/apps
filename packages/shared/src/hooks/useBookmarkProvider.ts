import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { useActiveFeedNameContext } from '../contexts';
import { SharedFeedPage } from '../components/utilities';

interface UseBookmarkProviderReturn {
  highlightBookmarkedPost: boolean;
}

export const useBookmarkProvider = (
  bookmarked: boolean,
): UseBookmarkProviderReturn => {
  const bookmarkProvider = useFeature(feature.bookmark_provider);
  const { feedName } = useActiveFeedNameContext();
  console.log(
    bookmarkProvider && feedName === SharedFeedPage.MyFeed && bookmarked,
  );
  return {
    highlightBookmarkedPost:
      bookmarkProvider && feedName === SharedFeedPage.MyFeed && bookmarked,
  };
};
