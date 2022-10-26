import React, { ReactElement, ReactNode, useMemo } from 'react';
import { IFlags } from 'flagsmith';
import {
  Features,
  getFeatureValue,
  isFeaturedEnabled,
} from '../lib/featureManagement';
import {
  MyFeedOnboardingVersion,
  OnboardingFiltersLayout,
  OnboardingVersion,
} from '../lib/featureValues';
import { OnboardingStep } from '../components/onboarding/common';
import { checkIsPreviewDeployment } from '../lib/links';
import { getCookieObject, getObjectFeaturesFlags } from '../lib/object';

interface Experiments {
  onboardingSteps?: OnboardingStep[];
  onboardingVersion?: OnboardingVersion;
  onboardingFiltersLayout?: OnboardingFiltersLayout;
  myFeedOnboardingVersion?: MyFeedOnboardingVersion;
  showCommentPopover?: boolean;
  postEngagementNonClickable?: boolean;
  postModalByDefault?: boolean;
  postCardVersion?: string;
  authVersion?: string;
  additionalInteractionButtonFeature?: string;
}

export interface FeaturesData extends Experiments {
  flags: IFlags;
}

const FeaturesContext = React.createContext<FeaturesData>({ flags: {} });
export default FeaturesContext;

export type FeaturesContextProviderProps = {
  children?: ReactNode;
  flags: IFlags | undefined;
};

export const FeaturesContextProvider = ({
  children,
  flags,
}: FeaturesContextProviderProps): ReactElement => {
  const steps = getFeatureValue(Features.OnboardingSteps, flags)?.split?.('/');
  const onboardingSteps = (steps as OnboardingStep[]) || [];
  const features = useMemo(
    () => ({
      flags,
      onboardingSteps,
      onboardingVersion: OnboardingVersion.V2,
      onboardingFiltersLayout: getFeatureValue(
        Features.OnboardingFiltersLayout,
        flags,
      ),
      myFeedOnboardingVersion: getFeatureValue(
        Features.MyFeedOnboardingVersion,
        flags,
      ),
      showCommentPopover: isFeaturedEnabled(Features.ShowCommentPopover, flags),
      postEngagementNonClickable: isFeaturedEnabled(
        Features.PostEngagementNonClickable,
        flags,
      ),
      postModalByDefault: isFeaturedEnabled(Features.PostModalByDefault, flags),
      postCardVersion: getFeatureValue(Features.PostCardVersion, flags),
      authVersion: getFeatureValue(Features.AuthenticationVersion, flags),
      additionalInteractionButtonFeature: getFeatureValue(
        Features.AdditionalInteractionButton,
        flags,
      ),
    }),
    [flags],
  );

  const featuresFlags: FeaturesData = useMemo(() => {
    const isPreviewDeployment = checkIsPreviewDeployment();

    if (!isPreviewDeployment) {
      return features;
    }

    const { flags: tmp, ...rest } = features;
    const cookie = getCookieObject();
    const keys = Object.keys(rest);
    const result: Experiments = getObjectFeaturesFlags(keys, cookie);

    return { ...features, ...result };
  }, [flags]);

  return (
    <FeaturesContext.Provider value={featuresFlags}>
      {children}
    </FeaturesContext.Provider>
  );
};
