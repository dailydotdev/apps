import { useContext, useEffect } from 'react';
import LogContext from '../contexts/LogContext';

interface UseLogModalProps {
  isOpen: boolean;
  title: string;
  trigger?: string;
}
export function useLogModal({
  isOpen,
  title,
  trigger,
}: UseLogModalProps): void {
  const { logEvent } = useContext(LogContext);
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    const logObject = {
      event_name: `${isOpen ? 'open' : 'close'} ${title}`,
      ...(trigger && { extra: JSON.stringify({ trigger }) }),
    };
    logEvent(logObject);

    if (isOpen === true) {
      return () => {
        // The modal was conditionally rendered we should fire a close event
        logObject.event_name = `close ${title}`;
        logEvent(logObject);
      };
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
}
