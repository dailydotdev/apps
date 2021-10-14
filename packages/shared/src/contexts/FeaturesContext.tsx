import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { IFlags } from 'flagsmith';
import { storageWrapper } from '../lib/storageWrapper';

const FEATURES_STATE_KEY = 'features';

export interface FeaturesData {
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
  const [features, setFeatures] = useState<{ flags: IFlags }>();

  useEffect(() => {
    if (storageWrapper.getItem(FEATURES_STATE_KEY)) {
      setFeatures(JSON.parse(storageWrapper.getItem(FEATURES_STATE_KEY)));
    }
  }, []);

  useEffect(() => {
    if (flags && Object.keys(flags)?.length) {
      const newFeats = { flags };
      setFeatures(newFeats);
      storageWrapper.setItem(FEATURES_STATE_KEY, JSON.stringify(newFeats));
    }
  }, [flags]);

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
