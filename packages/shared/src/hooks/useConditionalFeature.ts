import type { JSONValue, WidenPrimitives } from '@growthbook/growthbook';
import type { Feature } from '../lib/featureManagement';
import {
  useFeaturesReadyContext,
  useGrowthBookContext,
} from '../components/GrowthBookProvider';

interface UseConditionalFeature<T> {
  value: WidenPrimitives<T>;
  isLoading: boolean;
}
export const useConditionalFeature = <T extends JSONValue>({
  feature,
  shouldEvaluate,
}: {
  feature: Feature<T>;
  shouldEvaluate: boolean;
}): UseConditionalFeature<T> => {
  const { growthbook } = useGrowthBookContext();
  const { ready } = useFeaturesReadyContext();
  const isPending = !(shouldEvaluate && ready);
  let value: WidenPrimitives<T> = feature.defaultValue as WidenPrimitives<T>;

  if (!isPending) {
    value = growthbook
      ? growthbook.getFeatureValue(feature.id, feature.defaultValue)
      : value;
  }

  return {
    value,
    isLoading: isPending,
  };
};
