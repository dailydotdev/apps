import React, { ComponentType, ReactElement, useContext } from 'react';
import { FeaturesReadyContext } from './GrowthBookProvider';

const withFeaturesBoundary = <Props,>(
  WrappedComponent: ComponentType<Props>,
  options?: { fallback?: ComponentType<Props> },
): ComponentType<Props> => {
  const WithFeaturesBoundary = (props: Props): ReactElement => {
    const { ready: areFeaturesReady } = useContext(FeaturesReadyContext);

    if (!areFeaturesReady) {
      const FallbackComponent = options?.fallback;

      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }

    return <WrappedComponent {...props} />;
  };

  WithFeaturesBoundary.displayName = 'WithFeaturesBoundary';

  return WithFeaturesBoundary;
};

export { withFeaturesBoundary };
