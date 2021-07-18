import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { IFlags } from 'flagsmith';
import { FEATURES_STATE_KEY, FeaturesState } from '../lib/featureManagement';

export interface FeaturesData {
  flags: IFlags;
}

const FeaturesContext = React.createContext<FeaturesData>({ flags: {} });
export default FeaturesContext;

export type FeaturesContextProviderProps = {
  children?: ReactNode;
};

export const FeaturesContextProvider = ({
  children,
}: FeaturesContextProviderProps): ReactElement => {
  const [features, setFeatures] = useState<FeaturesState>();

  useEffect(() => {
    setFeatures(JSON.parse(localStorage.getItem(FEATURES_STATE_KEY)));
    const callback = (event: CustomEvent): void => setFeatures(event.detail);
    window.addEventListener('featuresLoaded', callback);
    return () => window.removeEventListener('featuresLoaded', callback);
  }, []);

  const contextData = useMemo<FeaturesData>(
    () => ({
      flags: features?.flags || {},
    }),
    [features],
  );

  return (
    <FeaturesContext.Provider value={contextData}>
      {children}
    </FeaturesContext.Provider>
  );
};
