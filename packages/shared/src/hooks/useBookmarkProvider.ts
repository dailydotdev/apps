import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import {
  useActiveFeedNameContext,
  useJustBookmarkedContext,
} from '../contexts';
import { SharedFeedPage } from '../components/utilities';

interface UseBookmarkProviderReturn {
  highlightBookmarkedPost: boolean;
}

interface UseBookmarkProviderProps {
  bookmarked?: boolean;
  postId: string;
}

const useBookmarkProvider = ({
  bookmarked = false,
  postId,
}: UseBookmarkProviderProps): UseBookmarkProviderReturn => {
  const bookmarkProvider = useFeature(feature.bookmark_provider);
  const { feedName } = useActiveFeedNameContext();
  const { isPostJustBookmarked } = useJustBookmarkedContext();
  const isJustBookmarked = isPostJustBookmarked(postId);

  return {
    highlightBookmarkedPost:
      bookmarkProvider &&
      feedName === SharedFeedPage.MyFeed &&
      bookmarked &&
      !isJustBookmarked,
  };
};

export default useBookmarkProvider;
