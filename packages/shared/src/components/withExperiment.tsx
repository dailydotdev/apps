import React, { ComponentType, ReactElement, ReactNode } from 'react';
import { JSONValue, WidenPrimitives } from '@growthbook/growthbook';
import { useFeature } from './GrowthBookProvider';
import { Feature } from '../lib/featureManagement';

export type WrappedComponentType<
  Props,
  LayoutProps = unknown,
> = ComponentType<Props> & {
  getLayout?: (
    page: ReactElement,
    pageProps?: Props,
    layoutProps?: LayoutProps,
  ) => ReactNode;
  layoutProps?: LayoutProps;
};

export const withExperiment = <
  Props,
  TFeature extends JSONValue,
  LayoutProps = unknown,
>(
  WrappedComponent: WrappedComponentType<Props, LayoutProps>,
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

  if (WrappedComponent.getLayout) {
    WithExperiment.getLayout = WrappedComponent.getLayout;
  }

  if (WrappedComponent.layoutProps) {
    WithExperiment.layoutProps = WrappedComponent.layoutProps;
  }

  return WithExperiment;
};
