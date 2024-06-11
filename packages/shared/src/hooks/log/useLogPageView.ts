import { MutableRefObject, useContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import LogContext from '../../contexts/LogContext';

export default function useLogPageView(): MutableRefObject<() => void> {
  const router = useRouter();
  const { trackEventStart, trackEventEnd } = useContext(LogContext);
  const routeChangedCallbackRef = useRef<() => void>();
  const lifecycleCallbackRef = useRef<(event: CustomEvent) => void>();

  useEffect(() => {
    routeChangedCallbackRef.current = () => {
      trackEventEnd('page view');
      trackEventStart('page view', { event_name: 'page view' });
    };

    lifecycleCallbackRef.current = (event) => {
      if (event.detail.newState === 'active') {
        trackEventStart('page view', { event_name: 'page view' });
      }
    };
  }, [trackEventStart, trackEventEnd]);

  useEffect(() => {
    const handleRouteChange = () => routeChangedCallbackRef.current();
    router.events.on('routeChangeComplete', handleRouteChange);

    const handleLifecycle = (event: CustomEvent) =>
      lifecycleCallbackRef.current(event);
    window.addEventListener('statechange', handleLifecycle);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      window.removeEventListener('statechange', handleLifecycle);
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return routeChangedCallbackRef;
}
