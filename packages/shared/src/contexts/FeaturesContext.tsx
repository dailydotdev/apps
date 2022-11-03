import React, { ReactElement, ReactNode, useMemo } from 'react';
import { IFlags } from 'flagsmith';
import {
  Features,
  getFeatureValue,
  isFeaturedEnabled,
} from '../lib/featureManagement';
import {
  OnboardingFiltersLayout,
  OnboardingVersion,
  ShareVersion,
} from '../lib/featureValues';
import { OnboardingStep } from '../components/onboarding/common';
import { getCookieFeatureFlags } from '../lib/cookie';
import { isPreviewDeployment } from '../lib/links';

interface Experiments {
  onboardingMinimumTopics?: number;
  onboardingSteps?: OnboardingStep[];
  onboardingVersion?: OnboardingVersion;
  onboardingFiltersLayout?: OnboardingFiltersLayout;
  popularFeedCopy?: string;
  submitArticleOn?: boolean;
  canSubmitArticle?: boolean;
  submitArticleSidebarButton?: string;
  submitArticleModalButton?: string;
  showCommentPopover?: boolean;
  postEngagementNonClickable?: boolean;
  postModalByDefault?: boolean;
  postCardVersion?: string;
  postCardShareVersion?: ShareVersion;
  authVersion?: string;
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
  const features = useMemo(() => {
    const steps = getFeatureValue(Features.OnboardingSteps, flags);
    const onboardingSteps = (steps?.split?.('/') || []) as OnboardingStep[];

    return {
      flags,
      onboardingSteps,
      onboardingMinimumTopics:
        getFeatureValue(Features.OnboardingMinimumTopics, flags) ?? 0,
      onboardingVersion: getFeatureValue(Features.UserOnboardingVersion, flags),
      onboardingFiltersLayout: getFeatureValue(
        Features.OnboardingFiltersLayout,
        flags,
      ),
      popularFeedCopy: getFeatureValue(Features.PopularFeedCopy, flags),
      showCommentPopover: isFeaturedEnabled(Features.ShowCommentPopover, flags),
      postEngagementNonClickable: isFeaturedEnabled(
        Features.PostEngagementNonClickable,
        flags,
      ),
      submitArticleOn: isFeaturedEnabled(Features.SubmitArticleOn, flags),
      canSubmitArticle: isFeaturedEnabled(Features.SubmitArticle, flags),
      submitArticleSidebarButton: getFeatureValue(
        Features.SubmitArticleSidebarButton,
        flags,
      ),
      submitArticleModalButton: getFeatureValue(
        Features.SubmitArticleModalButton,
        flags,
      ),
      postModalByDefault: isFeaturedEnabled(Features.PostModalByDefault, flags),
      postCardVersion: getFeatureValue(Features.PostCardVersion, flags),
      postCardShareVersion: getFeatureValue(
        Features.PostCardShareVersion,
        flags,
      ) as ShareVersion,
      authVersion: getFeatureValue(Features.AuthenticationVersion, flags),
    };
  }, [flags]);

  const featuresFlags: FeaturesData = useMemo(() => {
    if (!isPreviewDeployment) {
      return features;
    }

    const { onboardingSteps, ...featuresCookie }: Experiments =
      getCookieFeatureFlags();
    const steps =
      (onboardingSteps?.toString()?.split?.('/') as OnboardingStep[]) ||
      features.onboardingSteps;
    const value = { ...features, ...featuresCookie, onboardingSteps: steps };

    globalThis.getFeatureKeys = () => Object.keys(features);

    return value;
  }, [flags]);

  return (
    <FeaturesContext.Provider value={featuresFlags}>
      {children}
    </FeaturesContext.Provider>
  );
};
