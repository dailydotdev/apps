import { useViewSize, ViewSize } from '../useViewSize';
import { useConditionalFeature } from '../useConditionalFeature';
import { feature } from '../../lib/featureManagement';
import { AllFeedPages } from '../../lib/query';
import { SharedFeedPage } from '../../components/utilities';

interface UseSearchResultsLayoutProps {
  feedName: AllFeedPages;
}

interface SearchResultsLayout {
  isSearchResultsUpgrade: boolean;
}

export const useSearchResultsLayout = (
  props: UseSearchResultsLayoutProps,
): SearchResultsLayout => {
  const { feedName } = props;
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
