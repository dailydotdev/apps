import { useContext, useEffect } from 'react';
import AnalyticsContext from '../contexts/AnalyticsContext';

interface UseTrackModalProps {
  isOpen: boolean;
  title: string;
  trigger?: string;
}
export function useTrackModal({
  isOpen,
  title,
  trigger,
}: UseTrackModalProps): void {
  const { trackEvent } = useContext(AnalyticsContext);
  useEffect(() => {
    const trackObject = {
      event_name: `${isOpen ? 'open' : 'close'} ${title}`,
      ...(trigger && { extra: JSON.stringify({ trigger }) }),
    };
    trackEvent(trackObject);

    return () => {
      if (isOpen === true) {
        // The modal was conditionally rendered we should fire a close event
        trackObject.event_name = `close ${title}`;
        trackEvent(trackObject);
      }
    };
  }, [isOpen]);
}
