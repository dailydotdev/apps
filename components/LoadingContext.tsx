import React from 'react';

export interface LoadingContextData {
  windowLoaded: boolean;
}

const LoadingContext = React.createContext<LoadingContextData>({
  windowLoaded: false,
});
export default LoadingContext;
