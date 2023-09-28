import { useContext } from 'react';
import AnalyticsContext from '../contexts/AnalyticsContext';
import useWindowEvents from './useWindowEvents';

const WEB_VITALS = 'web_vitals_key';
export function useWebVitals(): void {
  const { trackEvent } = useContext(AnalyticsContext);

  useWindowEvents(
    'web-vitals',
    WEB_VITALS,
    (e) => {
      const { detail } = e as CustomEventInit;
      if (detail) {
        trackEvent({ event_name: detail.name, extra: JSON.stringify(detail) });
      }
    },
    false,
  );
}
