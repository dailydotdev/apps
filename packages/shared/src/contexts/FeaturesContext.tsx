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
  flags,
}: FeaturesContextProviderProps): ReactElement => {
  const features = useMemo(
    () => ({
      flags,
      postEngagementNonClickable: isFeaturedEnabled(
        Features.PostEngagementNonClickable,
        flags,
      ),
      postModalByDefault: isFeaturedEnabled(Features.PostModalByDefault, flags),
      postCardVersion: getFeatureValue(Features.PostCardVersion, flags),
      postHeadingFont: getThemeFont(
        getFeatureValue(Features.PostCardHeadingFont, flags),
        Features.PostCardHeadingFont.defaultValue,
      ),
      displayPublicationDate: !parseInt(
        getFeatureValue(Features.HidePublicationDate, flags),
        10,
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
