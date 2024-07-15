import { useRef } from 'react';
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
  const isBookmarked = useRef<boolean>(bookmarked);
  const { feedName } = useActiveFeedNameContext();
  const justBookmarked = bookmarked !== isBookmarked.current && bookmarked;

  const isMyFeed = feedName === SharedFeedPage.MyFeed;
  const highlightBookmarkedPost =
    isMyFeed && isBookmarked.current && !justBookmarked && bookmarked;

  return {
    highlightBookmarkedPost,
  };
};

export default useBookmarkProvider;
