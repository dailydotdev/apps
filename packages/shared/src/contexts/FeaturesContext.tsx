import React, { ReactElement, ReactNode, useMemo } from 'react';
import { IFlags } from 'flagsmith';
import {
  Features,
  getFeatureValue,
  isFeaturedEnabled,
} from '../lib/featureManagement';
import {
  AdditionalInteractionButtons,
  ShareVersion,
} from '../lib/featureValues';

export interface FeaturesData {
  flags: IFlags;
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
  additionalInteractionButtonFeature?: AdditionalInteractionButtons;
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
  const features = useMemo(
    () => ({
      flags,
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
      additionalInteractionButtonFeature: getFeatureValue(
        Features.AdditionalInteractionButton,
        flags,
      ) as AdditionalInteractionButtons,
    }),
    [flags],
  );

  return (
    <FeaturesContext.Provider value={features}>
      {children}
    </FeaturesContext.Provider>
  );
};
