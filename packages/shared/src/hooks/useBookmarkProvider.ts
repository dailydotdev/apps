import { useRef } from 'react';
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
  const isBookmarked = useRef<boolean>(bookmarked);
  const { feedName } = useActiveFeedNameContext();
  const justBookmarked = bookmarked !== isBookmarked.current && bookmarked;

  const isMyFeed = feedName === SharedFeedPage.MyFeed;
  const isCardShownFromBookmarkProvider =
    isMyFeed && isBookmarked.current && !justBookmarked && bookmarked;

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
