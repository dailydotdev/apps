import { useEffect, useState } from 'react';
import { feature } from '../lib/featureManagement';
import { useActiveFeedNameContext } from '../contexts';
import { SharedFeedPage } from '../components/utilities';
import { useConditionalFeature } from './useConditionalFeature';

interface UseBookmarkProviderReturn {
  highlightBookmarkedPost: boolean;
}

interface UseBookmarkProviderProps {
  bookmarked?: boolean;
}

const useBookmarkProvider = ({
  bookmarked = false,
}: UseBookmarkProviderProps): UseBookmarkProviderReturn => {
  const [isBookmarked] = useState<boolean>(bookmarked);
  const [justBookmarked, setJustBookmarked] = useState<boolean>(false);
  const { feedName } = useActiveFeedNameContext();

  useEffect(() => {
    if (bookmarked !== isBookmarked) {
      setJustBookmarked(bookmarked);
    }
  }, [bookmarked, justBookmarked, setJustBookmarked, isBookmarked]);

  const isMyFeed = feedName === SharedFeedPage.MyFeed;
  const isCardShownFromBookmarkProvider =
    isMyFeed && isBookmarked && !justBookmarked;

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
