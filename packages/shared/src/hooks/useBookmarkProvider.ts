import { useActiveFeedNameContext } from '../contexts';
import { SharedFeedPage } from '../components/utilities';
import { UseBookmarkProviderProps, useJustBookmarked } from './bookmark';

interface UseBookmarkProviderReturn {
  highlightBookmarkedPost: boolean;
}

const useBookmarkProvider = ({
  bookmarked = false,
}: UseBookmarkProviderProps): UseBookmarkProviderReturn => {
  const { feedName } = useActiveFeedNameContext();
  const { justBookmarked, wasBookmarked } = useJustBookmarked({ bookmarked });

  const isMyFeed = feedName === SharedFeedPage.MyFeed;
  const highlightBookmarkedPost =
    isMyFeed && wasBookmarked && !justBookmarked && bookmarked;

  return {
    highlightBookmarkedPost,
  };
};

export default useBookmarkProvider;
