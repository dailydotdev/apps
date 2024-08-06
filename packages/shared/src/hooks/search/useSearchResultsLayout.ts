import { useViewSize, ViewSize } from '../useViewSize';
import { SharedFeedPage } from '../../components/utilities';
import { useActiveFeedNameContext } from '../../contexts';

interface SearchResultsLayout {
  isSearchResultsUpgrade: boolean;
}

export const useSearchResultsLayout = (): SearchResultsLayout => {
  const { feedName } = useActiveFeedNameContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const shouldShowNewLayout = !!isLaptop && feedName === SharedFeedPage.Search;

  return {
    isSearchResultsUpgrade: shouldShowNewLayout,
  };
};

export default useSearchResultsLayout;
