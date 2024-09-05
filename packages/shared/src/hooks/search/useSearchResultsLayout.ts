import { SharedFeedPage } from '../../components/utilities';
import { useActiveFeedNameContext } from '../../contexts';
import { useViewSize, ViewSize } from '../useViewSize';

interface SearchResultsLayout {
  isSearchPageLaptop: boolean;
}

export const useSearchResultsLayout = (): SearchResultsLayout => {
  const { feedName } = useActiveFeedNameContext();
  const isLaptop = useViewSize(ViewSize.Laptop);

  return {
    isSearchPageLaptop: !!isLaptop && feedName === SharedFeedPage.Search,
  };
};

export default useSearchResultsLayout;
