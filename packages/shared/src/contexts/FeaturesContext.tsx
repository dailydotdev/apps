import React, { ReactElement, ReactNode, useMemo } from 'react';
import { IFlags } from 'flagsmith';
import {
  Features,
  getFeatureValue,
  isFeaturedEnabled,
} from '../lib/featureManagement';
import { ShareVersion } from '../lib/featureValues';

export interface FeaturesData {
  flags: IFlags;
  showCommentPopover?: boolean;
  postEngagementNonClickable?: boolean;
  postModalByDefault?: boolean;
  postCardVersion?: string;
  postCardShareVersion?: ShareVersion;
  authVersion?: string;
  additionalInteractionButtonFeature?: string;
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
      showCommentPopover: isFeaturedEnabled(Features.ShowCommentPopover, flags),
      postEngagementNonClickable: isFeaturedEnabled(
        Features.PostEngagementNonClickable,
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
      ),
    }),
    [flags],
  );

  return (
    <FeaturesContext.Provider value={features}>
      {children}
    </FeaturesContext.Provider>
  );
};
