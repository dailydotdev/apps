import { feature } from '../lib/featureManagement';
import {
  useActiveFeedNameContext,
  useJustBookmarkedContext,
} from '../contexts';
import { SharedFeedPage } from '../components/utilities';
import { useConditionalFeature } from './useConditionalFeature';

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
  const { feedName } = useActiveFeedNameContext();
  const { isPostJustBookmarked } = useJustBookmarkedContext();

  const isMyFeed = feedName === SharedFeedPage.MyFeed;
  const isJustBookmarked = isPostJustBookmarked(postId);
  const isCardShownFromBookmarkProvider =
    isMyFeed && bookmarked && !isJustBookmarked;

  const { value: bookmarkProvider } = useConditionalFeature({
    feature: feature.bookmark_provider,
    shouldEvaluate: isCardShownFromBookmarkProvider,
  });

  return {
    highlightBookmarkedPost:
      bookmarkProvider && isCardShownFromBookmarkProvider,
  };
};

export default useBookmarkProvider;
