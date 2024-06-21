import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';

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

export type ProgressiveEnhancementContextProviderProps = {
  children?: ReactNode;
};

export const ProgressiveEnhancementContextProvider = ({
  children,
}: ProgressiveEnhancementContextProviderProps): ReactElement => {
  const [windowLoaded, setWindowLoaded] = useState(false);
  const [nativeShareSupport, setNativeShareSupport] = useState(false);
  const [asyncImageSupport] = useState(false);
  const contextData = useMemo<ProgressiveEnhancementContextData>(
    () => ({ windowLoaded, asyncImageSupport, nativeShareSupport }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [windowLoaded, asyncImageSupport],
  );

  useEffect(() => {
    const callback = () => {
      setWindowLoaded(true);
      setNativeShareSupport('share' in navigator);
    };

    if ('windowLoaded' in window) {
      requestIdleCallback(callback);
    }
    window.addEventListener('load', callback, {
      once: true,
    });

    // Currently it reduces the PageSpeed score
    // if ('loading' in HTMLImageElement.prototype) {
    //   setAsyncImageSupport(true);
    // } else {
    //   import(/* webpackChunkName: "lazysizes" */ 'lazysizes');
    // }
  }, []);

  return (
    <ProgressiveEnhancementContext.Provider value={contextData}>
      {children}
    </ProgressiveEnhancementContext.Provider>
  );
};
