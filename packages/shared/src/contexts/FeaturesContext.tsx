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
} from '../lib/featureValues';
import { OnboardingStep } from '../components/onboarding/common';
import { checkIsPreviewDeployment } from '../lib/links';
import { getCookieObject, getObjectFeaturesFlags } from '../lib/object';

interface Experiments {
  onboardingMinimumTopics?: number;
  onboardingSteps?: OnboardingStep[];
  onboardingVersion?: OnboardingVersion;
  onboardingFiltersLayout?: OnboardingFiltersLayout;
  feedFilterVersion?: string;
  feedFilterCardVersion?: string;
  popularFeedCopy?: string;
  submitArticleOn?: boolean;
  canSubmitArticle?: boolean;
  submitArticleSidebarButton?: string;
  submitArticleModalButton?: string;
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
      onboardingMinimumTopics:
        getFeatureValue(Features.OnboardingMinimumTopics, flags) ?? 0,
      onboardingVersion: getFeatureValue(Features.UserOnboardingVersion, flags),
      onboardingFiltersLayout: getFeatureValue(
        Features.OnboardingFiltersLayout,
        flags,
      ),
      feedFilterVersion: getFeatureValue(Features.FeedFilterVersion, flags),
      feedFilterCardVersion: getFeatureValue(Features.FeedFilterVersion, flags),
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
    const result: Experiments = getObjectFeaturesFlags(keys, cookie, features);
    const value = { ...features, ...result };

    return value;
  }, [flags]);

  return (
    <FeaturesContext.Provider value={featuresFlags}>
      {children}
    </FeaturesContext.Provider>
  );
};
