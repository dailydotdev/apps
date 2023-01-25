import React, { ReactElement, ReactNode, useMemo } from 'react';
import { IFlags } from 'flagsmith';
import {
  Features,
  getFeatureValue,
  getNumberValue,
  isFeaturedEnabled,
} from '../lib/featureManagement';
import {
  InAppNotificationPosition,
  OnboardingFiltersLayout,
  ScrollOnboardingVersion,
} from '../lib/featureValues';
import { OnboardingStep } from '../components/onboarding/common';
import { getCookieFeatureFlags, updateFeatureFlags } from '../lib/cookie';
import { isPreviewDeployment } from '../lib/links';
import { BootCacheData } from '../lib/boot';

interface Experiments {
  onboardingMinimumTopics?: number;
  onboardingSteps?: OnboardingStep[];
  onboardingFiltersLayout?: OnboardingFiltersLayout;
  popularFeedCopy?: string;
  canSubmitArticle?: boolean;
  submitArticleSidebarButton?: string;
  submitArticleModalButton?: string;
  showCommentPopover?: boolean;
  postEngagementNonClickable?: boolean;
  postModalByDefault?: boolean;
  postCardVersion?: string;
  inAppNotificationPosition?: InAppNotificationPosition;
  scrollOnboardingVersion?: ScrollOnboardingVersion;
  hasSquadAccess?: boolean;
}

export interface FeaturesData extends Experiments {
  flags: IFlags;
  isFlagsFetched?: boolean;
  isFeaturesLoaded?: boolean;
}

const FeaturesContext = React.createContext<FeaturesData>({ flags: {} });
export default FeaturesContext;

export interface FeaturesContextProviderProps
  extends Pick<FeaturesData, 'flags' | 'isFlagsFetched' | 'isFeaturesLoaded'>,
    Pick<BootCacheData, 'features'> {
  children?: ReactNode;
}

const getFeatures = (flags: IFlags): FeaturesData => {
  const steps = getFeatureValue(Features.OnboardingSteps, flags);
  const onboardingSteps = (steps?.split?.('/') || []) as OnboardingStep[];
  const minimumTopics = getFeatureValue(
    Features.OnboardingMinimumTopics,
    flags,
  );

  return {
    flags,
    onboardingSteps,
    onboardingMinimumTopics: getNumberValue(minimumTopics, 0),
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
    inAppNotificationPosition: getFeatureValue(
      Features.InAppNotificationPosition,
      flags,
    ),
    scrollOnboardingVersion: getFeatureValue(
      Features.ScrollOnboardingVersion,
      flags,
    ),
    hasSquadAccess: isFeaturedEnabled(Features.HasSquadAccess, flags),
  };
};

export const FeaturesContextProvider = ({
  isFeaturesLoaded,
  isFlagsFetched,
  children,
  flags,
  features,
}: FeaturesContextProviderProps): ReactElement => {
  const featuresFlags: FeaturesData = useMemo(() => {
    const combinedFlags = { ...flags, ...features };
    const flagFeatures = getFeatures(combinedFlags);
    const props = { isFeaturesLoaded, isFlagsFetched };

    if (!isPreviewDeployment) {
      return { ...flagFeatures, ...props };
    }

    const featuresCookie = getCookieFeatureFlags();
    const updated = updateFeatureFlags(combinedFlags, featuresCookie);
    const result = getFeatures(updated);

    globalThis.getFeatureKeys = () => Object.keys(flagFeatures);
    return { ...result, ...props };
  }, [flags, isFeaturesLoaded, isFlagsFetched, features]);

  return (
    <FeaturesContext.Provider value={featuresFlags}>
      {children}
    </FeaturesContext.Provider>
  );
};
