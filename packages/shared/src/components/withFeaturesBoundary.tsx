import React, { ComponentType, ReactElement, useContext } from 'react';
import { FeaturesReadyContext } from './GrowthBookProvider';
import { useHostStatus } from '../hooks/useHostPermissionStatus';
import { checkIsExtension } from '../lib/func';

const withFeaturesBoundary = <Props,>(
  WrappedComponent: ComponentType<Props>,
  options?: { fallback?: ReactElement },
): ComponentType<Props> => {
  const WithFeaturesBoundary = (props: Props): ReactElement => {
    const { ready: areFeaturesReady } = useContext(FeaturesReadyContext);
    const { hostGranted } = useHostStatus();
    const isExtension = checkIsExtension();

    if (isExtension && !hostGranted) {
      return <WrappedComponent {...props} />;
    }

    if (!areFeaturesReady) {
      return options?.fallback ?? null;
    }

    return <WrappedComponent {...props} />;
  };

  WithFeaturesBoundary.displayName = 'WithFeaturesBoundary';

  return WithFeaturesBoundary;
};

export { withFeaturesBoundary };
