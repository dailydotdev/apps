import React, { ComponentType, ReactElement, useContext } from 'react';
import { FeaturesReadyContext } from './GrowthBookProvider';

const withFeaturesBoundary = <Props,>(
  WrappedComponent: ComponentType<Props>,
  options?: { fallback?: ReactElement },
): ComponentType<Props> => {
  const WithFeaturesBoundary = (props: Props): ReactElement => {
    const { ready: areFeaturesReady } = useContext(FeaturesReadyContext);

    if (!areFeaturesReady) {
      return options?.fallback ?? null;
    }

    return <WrappedComponent {...props} />;
  };

  WithFeaturesBoundary.displayName = 'WithFeaturesBoundary';

  return WithFeaturesBoundary;
};

export { withFeaturesBoundary };
