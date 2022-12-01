import { useContext, useEffect } from 'react';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../lib/analytics';

export function useError(): void {
  const { trackEvent } = useContext(AnalyticsContext);

  useEffect(() => {
    if (trackEvent) {
      window.onerror = (msg, url, line, col, error) => {
        trackEvent({
          event_name: AnalyticsEvent.GlobalError,
          extra: JSON.stringify({
            msg,
            url,
            line,
            col,
            error,
          }),
        });
      };
    }
  }, [trackEvent]);
}
