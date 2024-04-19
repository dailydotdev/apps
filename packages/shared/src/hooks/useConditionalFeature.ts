import { useQuery } from '@tanstack/react-query';
import { JSONValue, WidenPrimitives } from '@growthbook/growthbook';
import { useContext } from 'react';
import { generateQueryKey, RequestKey } from '../lib/query';
import { Feature } from '../lib/featureManagement';
import { disabledRefetch } from '../lib/func';
import AuthContext from '../contexts/AuthContext';
import {
  useFeaturesReadyContext,
  useGrowthBookContext,
} from '../components/GrowthBookProvider';

interface UseConditionalFeatureProps<
  T extends JSONValue,
  V = WidenPrimitives<T>,
> {
  feature: Feature<T>;
  shouldEvaluate: boolean;
  onAfterEvaluation?: (value: V) => void;
}

interface UseConditionalFeature<T> {
  value: WidenPrimitives<T>;
  isLoading: boolean;
}

export const useConditionalFeature = <T extends JSONValue>({
  feature,
  shouldEvaluate,
  onAfterEvaluation,
}: UseConditionalFeatureProps<T>): UseConditionalFeature<T> => {
  const { user } = useContext(AuthContext);
  const { growthbook } = useGrowthBookContext();
  const { ready } = useFeaturesReadyContext();
  const queryKey = generateQueryKey(
    RequestKey.Feature,
    user,
    feature.id,
    shouldEvaluate,
  );

  const { data: featureValue, isLoading } = useQuery(
    queryKey,
    async () => {
      if (!shouldEvaluate) {
        return feature.defaultValue as WidenPrimitives<T>;
      }

      const value = await (growthbook
        ? growthbook.getFeatureValue(feature.id, feature.defaultValue)
        : Promise.resolve(feature.defaultValue as WidenPrimitives<T>));

      if (onAfterEvaluation) {
        onAfterEvaluation(value);
      }

      return value;
    },
    {
      enabled: shouldEvaluate && ready,
      ...disabledRefetch,
    },
  );

  return {
    value: featureValue ?? (feature.defaultValue as WidenPrimitives<T>),
    isLoading,
  };
};
