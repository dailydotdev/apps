import { useActiveFeedNameContext } from '../contexts/ActiveFeedNameContext';
import { SharedFeedPage } from '../components/utilities';
import type { UseBookmarkProviderProps } from './bookmark';
import { useJustBookmarked } from './bookmark';

interface UseBookmarkProviderReturn {
  highlightBookmarkedPost: boolean;
}

export const useBookmarkProvider = ({
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
