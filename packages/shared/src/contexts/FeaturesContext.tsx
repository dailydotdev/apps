import React, { ReactElement, ReactNode, useContext, useMemo } from 'react';
import { IFlags } from 'flagsmith';

export interface FeaturesData {
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

export const FeaturesContextProvider = ({
  isFeaturesLoaded,
  isFlagsFetched,
  children,
  flags,
}: FeaturesContextProviderProps): ReactElement => {
  const featuresFlags: FeaturesData = useMemo(() => {
    const props = { isFeaturesLoaded, isFlagsFetched };

    return { flags, ...props };
  }, [flags, isFeaturesLoaded, isFlagsFetched]);

  return (
    <FeaturesContext.Provider value={featuresFlags}>
      {children}
    </FeaturesContext.Provider>
  );
};

export const useFeaturesContext = (): FeaturesData =>
  useContext(FeaturesContext);
