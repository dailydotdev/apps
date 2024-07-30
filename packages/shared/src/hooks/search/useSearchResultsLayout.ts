import { useViewSize, ViewSize } from '../useViewSize';
import { useConditionalFeature } from '../useConditionalFeature';
import { feature } from '../../lib/featureManagement';
import { SharedFeedPage } from '../../components/utilities';
import { useActiveFeedNameContext } from '../../contexts';

interface SearchResultsLayout {
  isSearchResultsUpgrade: boolean;
}

export const useSearchResultsLayout = (): SearchResultsLayout => {
  const { feedName } = useActiveFeedNameContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { value: isSearchUpgradeExperiment, isLoading } = useConditionalFeature(
    {
      feature: feature.searchResultsUpgrade,
      shouldEvaluate: !!isLaptop && feedName === SharedFeedPage.Search,
    },
  );

  const isSearchResultsUpgrade =
    !isLoading && isSearchUpgradeExperiment && isLaptop;

  return {
    isSearchResultsUpgrade,
  };
};

export default useSearchResultsLayout;
