import React, { ReactNode } from 'react';
import { IFlags } from 'flagsmith';

export interface FeaturesData {
  flags: IFlags;
}

const FeaturesContext = React.createContext<FeaturesData>({ flags: {} });
export default FeaturesContext;

export type FeaturesContextProviderProps = {
  children?: ReactNode;
  flags: IFlags | undefined;
};
