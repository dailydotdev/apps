import React from 'react';
import { IFlags } from 'flagsmith';

export interface FeaturesData {
  flags: IFlags;
}

const FeaturesContext = React.createContext<FeaturesData>({ flags: {} });
export default FeaturesContext;
