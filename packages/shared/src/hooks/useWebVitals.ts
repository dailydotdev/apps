import { useCallback, useContext, useEffect } from 'react';
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';
import LogContext from '../contexts/LogContext';

export function useWebVitals(): void {
  const { trackEvent } = useContext(LogContext);

  const trackMetric = useCallback(
    (metric) => {
      const { name, entries, id, ...rest } = metric;
      trackEvent({ event_name: name, extra: JSON.stringify(rest) });
    },
    [trackEvent],
  );

  // Have to wait for document to load and ensure it's not run on SSR
  useEffect(() => {
    // We apply sampling rate of 10%
    if (Math.random() < 0.1) {
      onCLS(trackMetric);
      onFID(trackMetric);
      onLCP(trackMetric);
      onTTFB(trackMetric);
      onFCP(trackMetric);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
