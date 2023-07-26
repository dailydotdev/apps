import React, { ReactElement, ReactNode, useContext, useMemo } from 'react';
import { IFlags } from 'flagsmith';
import {
  Features,
  getFeatureValue,
  isFeaturedEnabled,
} from '../lib/featureManagement';
import { OnboardingFilteringTitle, OnboardingV2 } from '../lib/featureValues';
import { getCookieFeatureFlags, updateFeatureFlags } from '../lib/cookie';
import { isPreviewDeployment } from '../lib/links';

interface Experiments {
  canSubmitArticle?: boolean;
  showHiring?: boolean;
  onboardingV2?: OnboardingV2;
  onboardingFilteringTitle?: OnboardingFilteringTitle;
}

export interface FeaturesData extends Experiments {
  flags: IFlags;
  isFlagsFetched?: boolean;
  isFeaturesLoaded?: boolean;
}

const FeaturesContext = React.createContext<FeaturesData>({ flags: {} });
export default FeaturesContext;

export interface FeaturesContextProviderProps
  extends Pick<FeaturesData, 'flags' | 'isFlagsFetched' | 'isFeaturesLoaded'> {
  children?: ReactNode;
}

const getFeatures = (flags: IFlags): FeaturesData => {
  return {
    flags,
    canSubmitArticle: isFeaturedEnabled(Features.SubmitArticle, flags),
    onboardingFilteringTitle: getFeatureValue(
      Features.OnboardingFilteringTitle,
      flags,
    ),
    onboardingV2: getFeatureValue(Features.OnboardingV2, flags),
    showHiring: isFeaturedEnabled(Features.ShowHiring, flags),
  };
};

export const FeaturesContextProvider = ({
  isFeaturesLoaded,
  isFlagsFetched,
  children,
  flags,
}: FeaturesContextProviderProps): ReactElement => {
  const featuresFlags: FeaturesData = useMemo(() => {
    const features = getFeatures(flags);
    const props = { isFeaturesLoaded, isFlagsFetched };

    if (!isPreviewDeployment) {
      return { ...features, ...props };
    }

    const featuresCookie = getCookieFeatureFlags();
    const updated = updateFeatureFlags(flags, featuresCookie);
    const result = getFeatures(updated);

    globalThis.getFeatureKeys = () => Object.keys(flags);

    return { ...result, ...props };
  }, [flags, isFeaturesLoaded, isFlagsFetched]);

  return (
    <FeaturesContext.Provider value={featuresFlags}>
      {children}
    </FeaturesContext.Provider>
  );
};

export const useFeaturesContext = (): FeaturesData =>
  useContext(FeaturesContext);
