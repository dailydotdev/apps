import { ProgressiveEnhancementContextData } from '../contexts/ProgressiveEnhancementContext';
import { useEffect, useMemo, useState } from 'react';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';

export default function useProgressiveEnhancement(): ProgressiveEnhancementContextData {
  const [windowLoaded, setWindowLoaded] = useState(false);
  const [nativeShareSupport, setNativeShareSupport] = useState(false);
  const [asyncImageSupport] = useState(false);
  const contextData = useMemo<ProgressiveEnhancementContextData>(
    () => ({ windowLoaded, asyncImageSupport, nativeShareSupport }),
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

  return contextData;
}
