import React, { ReactElement, ReactNode, useMemo } from 'react';
import { IFlags } from 'flagsmith';
import {
  Features,
  getFeatureValue,
  isFeaturedEnabled,
} from '../lib/featureManagement';
import { getThemeFont } from '../components/utilities';

export interface FeaturesData {
  flags: IFlags;
  postEngagementNonClickable?: boolean;
  postModalByDefault?: boolean;
  postCardVersion?: string;
  postHeadingFont?: string;
  displayPublicationDate?: boolean;
}

const FeaturesContext = React.createContext<FeaturesData>({ flags: {} });
export default FeaturesContext;

export type FeaturesContextProviderProps = {
  children?: ReactNode;
  flags: IFlags | undefined;
};

export const FeaturesContextProvider = ({
  children,
  flags: remoteFlags,
}: FeaturesContextProviderProps): ReactElement => {
  const features = useMemo(
    () => ({
      flags: remoteFlags,
      postEngagementNonClickable: isFeaturedEnabled(
        Features.PostEngagementNonClickable,
        remoteFlags,
      ),
      postModalByDefault: isFeaturedEnabled(
        Features.PostModalByDefault,
        remoteFlags,
      ),
      postCardVersion: getFeatureValue(Features.PostCardVersion, remoteFlags),
      postHeadingFont: getThemeFont(
        getFeatureValue(Features.PostCardHeadingFont, remoteFlags),
        Features.PostCardHeadingFont.defaultValue,
      ),
      displayPublicationDate: !parseInt(
        getFeatureValue(Features.HidePublicationDate, remoteFlags),
        10,
      ),
    }),
    [remoteFlags],
  );

  return (
    <FeaturesContext.Provider value={features}>
      {children}
    </FeaturesContext.Provider>
  );
};
