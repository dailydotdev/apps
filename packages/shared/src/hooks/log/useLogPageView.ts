import { useCallback, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import LogContext from '../../contexts/LogContext';

export default function useLogPageView(): () => void {
  const router = useRouter();
  const { logEventStart, logEventEnd } = useContext(LogContext);
  const routeChangedCallback = useCallback(() => {
    logEventEnd('page view');
    logEventStart('page view', { event_name: 'page view' });
  }, [logEventEnd, logEventStart]);

  const lifecycleCallback = useCallback(
    (event: CustomEvent) => {
      if (event.detail.newState === 'active') {
        logEventStart('page view', { event_name: 'page view' });
      }
    },
    [logEventStart],
  );

  useEffect(() => {
    const handleRouteChange = () => routeChangedCallback();
    router.events.on('routeChangeComplete', handleRouteChange);

    const handleLifecycle = (event: CustomEvent) => lifecycleCallback(event);
    window.addEventListener('statechange', handleLifecycle);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      window.removeEventListener('statechange', handleLifecycle);
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lifecycleCallback, routeChangedCallback]);

  return routeChangedCallback;
}
