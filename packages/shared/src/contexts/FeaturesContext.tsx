import React, { ReactElement, ReactNode, useMemo } from 'react';
import { IFlags } from 'flagsmith';
import {
  Features,
  getFeatureValue,
  isFeaturedEnabled,
} from '../lib/featureManagement';

export interface FeaturesData {
  flags: IFlags;
  postEngagementNonClickable?: boolean;
  postModalByDefault?: boolean;
  postCardVersion?: string;
}

const FeaturesContext = React.createContext<FeaturesData>({ flags: {} });
export default FeaturesContext;

export type FeaturesContextProviderProps = {
  children?: ReactNode;
  remoteFlags: IFlags | undefined;
};

export const FeaturesContextProvider = ({
  children,
  remoteFlags,
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
    }),
    [remoteFlags],
  );

  return (
    <FeaturesContext.Provider value={features}>
      {children}
    </FeaturesContext.Provider>
  );
};
