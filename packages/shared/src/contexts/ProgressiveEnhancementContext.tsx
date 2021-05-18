import React from 'react';

export interface ProgressiveEnhancementContextData {
  windowLoaded: boolean;
  asyncImageSupport: boolean;
  nativeShareSupport: boolean;
}

const ProgressiveEnhancementContext =
  React.createContext<ProgressiveEnhancementContextData>({
    windowLoaded: false,
    asyncImageSupport: false,
    nativeShareSupport: false,
  });
export default ProgressiveEnhancementContext;
