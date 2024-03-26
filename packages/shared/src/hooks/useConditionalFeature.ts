import { useQuery } from '@tanstack/react-query';
import { JSONValue, WidenPrimitives } from '@growthbook/growthbook';
import { useGrowthBook } from '@growthbook/growthbook-react';
import { useContext } from 'react';
import { generateQueryKey, RequestKey } from '../lib/query';
import { Feature } from '../lib/featureManagement';
import { disabledRefetch } from '../lib/func';
import AuthContext from '../contexts/AuthContext';
import { useGrowthBookContext } from '../components/GrowthBookProvider';

export const useConditionalFeature = <T extends JSONValue>({
  feature,
  shouldEvaluate,
}: {
  feature: Feature<T>;
  shouldEvaluate: boolean;
}): WidenPrimitives<T> => {
  const { user } = useContext(AuthContext);
  const { growthbook } = useGrowthBookContext();
  const queryKey = generateQueryKey(RequestKey.Feature, user, feature.id);

  const { data: featureValue } = useQuery(
    queryKey,
    () => {
      return growthbook
        ? growthbook.getFeatureValue(feature.id, feature.defaultValue)
        : (feature.defaultValue as WidenPrimitives<T>);
    },
    {
      initialData: feature.defaultValue as WidenPrimitives<T>,
      enabled: shouldEvaluate,
      ...disabledRefetch,
    },
  );

  return featureValue;
};
