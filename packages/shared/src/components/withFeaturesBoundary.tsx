import React, {
  ComponentType,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import { FeaturesReadyContext } from './GrowthBookProvider';

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

const withFeaturesBoundary = <Props, LayoutProps = unknown>(
  WrappedComponent: WrappedComponentType<Props, LayoutProps>,
  options?: { fallback?: ComponentType<Props> },
): WrappedComponentType<Props, LayoutProps> => {
  const WithFeaturesBoundary = (props: Props): ReactElement => {
    const { ready: areFeaturesReady } = useContext(FeaturesReadyContext);

    if (!areFeaturesReady) {
      const FallbackComponent = options?.fallback;

      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }

    return <WrappedComponent {...props} />;
  };

  WithFeaturesBoundary.displayName = 'WithFeaturesBoundary';

  if (WrappedComponent.getLayout) {
    WithFeaturesBoundary.getLayout = WrappedComponent.getLayout;
  }

  if (WrappedComponent.layoutProps) {
    WithFeaturesBoundary.layoutProps = WrappedComponent.layoutProps;
  }

  return WithFeaturesBoundary;
};

export { withFeaturesBoundary };
