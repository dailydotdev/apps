import { useContext, useEffect } from 'react';
import LogContext from '../contexts/LogContext';
import { LogsEvent } from '../lib/logs';

export function useError(): void {
  const { trackEvent } = useContext(LogContext);

  useEffect(() => {
    if (trackEvent) {
      window.onerror = (msg, url, line, col, error) => {
        trackEvent({
          event_name: LogsEvent.GlobalError,
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
