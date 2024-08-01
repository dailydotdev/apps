import { useViewSize, ViewSize } from '../useViewSize';
import { useConditionalFeature } from '../useConditionalFeature';
import { feature } from '../../lib/featureManagement';
import { SharedFeedPage } from '../../components/utilities';
import { useActiveFeedNameContext } from '../../contexts';

interface SearchResultsLayout {
  isSearchResultsUpgrade: boolean;
  isLoading: boolean;
}

export const useSearchResultsLayout = (): SearchResultsLayout => {
  const { feedName } = useActiveFeedNameContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const shouldShowNewLayout = !!isLaptop && feedName === SharedFeedPage.Search;

  const { value: isSearchUpgradeExperiment, isLoading } = useConditionalFeature(
    {
      feature: feature.searchResultsUpgrade,
      shouldEvaluate: shouldShowNewLayout,
    },
  );

  const isSearchResultsUpgrade =
    !isLoading && isSearchUpgradeExperiment && shouldShowNewLayout;

  return {
    isSearchResultsUpgrade,
    isLoading,
  };
};

export default useSearchResultsLayout;
