import { useEffect, useRef } from 'react';
import { useActiveFeedNameContext } from '../contexts';
import { SharedFeedPage } from '../components/utilities';
import { isNullOrUndefined } from '../lib/func';

interface UseBookmarkProviderReturn {
  highlightBookmarkedPost: boolean;
}

interface UseBookmarkProviderProps {
  bookmarked: boolean;
}

interface UseJustBookmarked {
  justBookmarked: boolean;
  wasBookmarked: boolean;
}

export const useJustBookmarked = ({
  bookmarked,
}: UseBookmarkProviderProps): UseJustBookmarked => {
  const wasBookmarkedRef = useRef<boolean>(bookmarked);
  const justBookmarked = bookmarked !== wasBookmarkedRef.current && bookmarked;

  useEffect(() => {
    const isInitialRender =
      isNullOrUndefined(wasBookmarkedRef.current) &&
      !isNullOrUndefined(bookmarked);
    const turnedOffBookmark = wasBookmarkedRef.current && !bookmarked;

    if (isInitialRender || turnedOffBookmark) {
      wasBookmarkedRef.current = bookmarked;
    }
  }, [bookmarked]);

  return { justBookmarked, wasBookmarked: wasBookmarkedRef.current };
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
