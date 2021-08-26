import { useContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import AnalyticsContext from '../contexts/AnalyticsContext';

export default function useTrackPageView(): void {
  const router = useRouter();
  const { trackEventStart, trackEventEnd } = useContext(AnalyticsContext);
  const callbackRef = useRef<() => void>();

  useEffect(() => {
    callbackRef.current = () => {
      trackEventEnd('page view');
      trackEventStart('page view', { event_name: 'page view' });
    };
  }, [trackEventStart, trackEventEnd]);

  useEffect(() => {
    const handleRouteChange = () => callbackRef.current();
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, []);
}
