import React, { ComponentType, ReactElement } from 'react';
import { JSONValue, WidenPrimitives } from '@growthbook/growthbook';
import { useFeature } from './GrowthBookProvider';
import { Feature } from '../lib/featureManagement';

export const withExperiment = <Props, TFeature extends JSONValue>(
  WrappedComponent: ComponentType<Props>,
  options?: {
    feature: Feature<TFeature>;
    value: WidenPrimitives<TFeature>;
    fallback?: ComponentType<Props>;
  },
): ComponentType<Props> => {
  const WithExperiment = (props: Props): ReactElement => {
    const featureValue = useFeature(options.feature);

    if (featureValue !== options.value) {
      const FallbackComponent = options?.fallback;

      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }

    return <WrappedComponent {...props} />;
  };

  WithExperiment.displayName = 'WithExperiment';

  return WithExperiment;
};
