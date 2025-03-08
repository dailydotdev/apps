import { useSettingsContext } from '../../contexts/SettingsContext';
import { featureCustomFeedPlacement } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import { useViewSize, ViewSize } from '../useViewSize';

const useCustomFeedHeader = (): { customFeedPlacement: boolean } => {
  const { insaneMode } = useSettingsContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const shouldEvaluate = !insaneMode && isLaptop;
  const { value: customFeedPlacementExperiment } = useConditionalFeature({
    feature: featureCustomFeedPlacement,
    shouldEvaluate,
  });
  // Make sure that the header is not shown if user changes to list view after being enrolled.
  const customFeedPlacement = customFeedPlacementExperiment && shouldEvaluate;

  return {
    customFeedPlacement,
  };
};

export default useCustomFeedHeader;
