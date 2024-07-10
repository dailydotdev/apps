import { useRef } from 'react';
import { useActiveFeedNameContext } from '../contexts';
import { SharedFeedPage } from '../components/utilities';

interface UseBookmarkProviderReturn {
  highlightBookmarkedPost: boolean;
}

interface UseBookmarkProviderProps {
  bookmarked?: boolean;
}

interface UseJustBookmarked {
  justBookmarked: boolean;
  wasBookmarked: boolean;
}

export const useJustBookmarked = ({
  bookmarked = false,
}: UseBookmarkProviderProps): UseJustBookmarked => {
  const wasBookmarked = useRef<boolean>(bookmarked);
  const justBookmarked = bookmarked !== wasBookmarked.current && bookmarked;

  return { justBookmarked, wasBookmarked: wasBookmarked.current };
};

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
