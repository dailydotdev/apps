import React, { ReactElement, ReactNode, useMemo } from 'react';
import { IFlags } from 'flagsmith';
import {
  Features,
  getFeatureValue,
  getNumberValue,
  isFeaturedEnabled,
} from '../lib/featureManagement';
import {
  ArticleOnboardingVersion,
  OnboardingFiltersLayout,
  OnboardingVersion,
  ScrollOnboardingVersion,
  ShareVersion,
  SquadVersion,
} from '../lib/featureValues';
import { OnboardingStep } from '../components/onboarding/common';
import { getCookieFeatureFlags, updateFeatureFlags } from '../lib/cookie';
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
  squadVersion?: SquadVersion;
  squadForm?: string;
  squadButton?: string;
  articleOnboardingVersion?: ArticleOnboardingVersion;
  scrollOnboardingVersion?: ScrollOnboardingVersion;
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
    postCardShareVersion: getFeatureValue(Features.PostCardShareVersion, flags),
    authVersion: getFeatureValue(Features.AuthenticationVersion, flags),
    squadVersion: getFeatureValue(Features.SquadVersion, flags),
    squadForm: getFeatureValue(Features.SquadForm, flags),
    squadButton: getFeatureValue(Features.SquadButton, flags),
    articleOnboardingVersion: getFeatureValue(
      Features.ArticleOnboardingVersion,
      flags,
    ),
    scrollOnboardingVersion: getFeatureValue(
      Features.ScrollOnboardingVersion,
      flags,
    ),
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

    globalThis.getFeatureKeys = () => Object.keys(features);

    return { ...result, ...props };
  }, [flags, isFeaturesLoaded, isFlagsFetched]);

  return (
    <FeaturesContext.Provider value={featuresFlags}>
      {children}
    </FeaturesContext.Provider>
  );
};
