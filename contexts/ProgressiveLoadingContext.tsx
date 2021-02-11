import React from 'react';

export interface ProgressiveLoadingContextData {
  windowLoaded: boolean;
  asyncImageSupport: boolean;
}

const ProgressiveLoadingContext = React.createContext<ProgressiveLoadingContextData>(
  {
    windowLoaded: false,
    asyncImageSupport: false,
  },
);
export default ProgressiveLoadingContext;
