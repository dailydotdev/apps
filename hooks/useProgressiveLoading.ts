import { ProgressiveLoadingContextData } from '../contexts/ProgressiveLoadingContext';
import { useEffect, useMemo, useState } from 'react';
import requestIdleCallback from 'next/dist/client/request-idle-callback';

export default function useProgressiveLoading(): ProgressiveLoadingContextData {
  const [windowLoaded, setWindowLoaded] = useState(false);
  const [asyncImageSupport] = useState(false);
  const contextData = useMemo(() => ({ windowLoaded, asyncImageSupport }), [
    windowLoaded,
    asyncImageSupport,
  ]);

  useEffect(() => {
    const callback = () => {
      setWindowLoaded(true);
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

  return contextData;
}
