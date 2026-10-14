import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useLogContext } from '../../contexts/LogContext';
import { getAdPageViewId } from '../../features/monetization/adPageView';

export default function useLogPageView(): MutableRefObject<() => void> {
  const router = useRouter();
  const { logEventStart, logEventEnd } = useLogContext();
  const onRouteChange = useCallback(
    (url?: string) => {
      getAdPageViewId(url);
      logEventEnd('page view');
      logEventStart('page view', { event_name: 'page view' });
    },
    [logEventStart, logEventEnd],
  );
  const routeChangedCallbackRef = useRef(onRouteChange);
  routeChangedCallbackRef.current = onRouteChange;

  useEffect(() => {
    const handleRouteChange = (url: string) =>
      routeChangedCallbackRef.current(url);
    router.events.on('routeChangeComplete', handleRouteChange);

    const handleLifecycle = (event: Event) => {
      const { detail } = event as CustomEvent<{ newState?: string }>;
      if (detail?.newState === 'active') {
        logEventStart('page view', { event_name: 'page view' });
      }
    };
    window.addEventListener('statechange', handleLifecycle);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      window.removeEventListener('statechange', handleLifecycle);
    };
  }, [router.events, logEventStart]);

  return routeChangedCallbackRef;
}
