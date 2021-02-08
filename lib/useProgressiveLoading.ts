import { ProgressiveLoadingContextData } from '../components/ProgressiveLoadingContext';
import { useEffect, useMemo, useState } from 'react';

export default function useProgressiveLoading(): ProgressiveLoadingContextData {
  const [windowLoaded, setWindowLoaded] = useState(false);
  const [asyncImageSupport] = useState(false);
  const contextData = useMemo(() => ({ windowLoaded, asyncImageSupport }), [
    windowLoaded,
    asyncImageSupport,
  ]);

  useEffect(() => {
    if ('windowLoaded' in window) {
      setWindowLoaded(true);
    }
    window.addEventListener('load', () => setWindowLoaded(true), {
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
