import { useContext, useEffect } from 'react';
import LogContext from '../contexts/LogContext';

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
  const { trackEvent } = useContext(LogContext);
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    const trackObject = {
      event_name: `${isOpen ? 'open' : 'close'} ${title}`,
      ...(trigger && { extra: JSON.stringify({ trigger }) }),
    };
    trackEvent(trackObject);

    if (isOpen === true) {
      return () => {
        // The modal was conditionally rendered we should fire a close event
        trackObject.event_name = `close ${title}`;
        trackEvent(trackObject);
      };
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
}
