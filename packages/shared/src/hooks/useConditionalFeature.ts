import { useQuery } from '@tanstack/react-query';
import { JSONValue, WidenPrimitives } from '@growthbook/growthbook';
import { useGrowthBook } from '@growthbook/growthbook-react';
import { generateQueryKey, RequestKey } from '../lib/query';
import { Feature } from '../lib/featureManagement';
import { disabledRefetch } from '../lib/func';

export const useConditionalFeature = <T extends JSONValue>({
  feature,
  shouldEvaluate,
}: {
  feature: Feature<T>;
  shouldEvaluate: boolean;
}): WidenPrimitives<T> => {
  const growthbook = useGrowthBook();
  const queryKey = generateQueryKey(
    RequestKey.Feature,
    null,
    feature.id,
    shouldEvaluate,
  );

  const { data: featureValue } = useQuery(
    queryKey,
    () => {
      return growthbook
        ? growthbook.getFeatureValue(feature.id, feature.defaultValue)
        : (feature.defaultValue as WidenPrimitives<T>);
    },
    {
      enabled: shouldEvaluate,
      ...disabledRefetch,
    },
  );

  return featureValue ?? (feature.defaultValue as WidenPrimitives<T>);
};
