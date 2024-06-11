import { useContext, useEffect } from 'react';
import LogContext from '../contexts/LogContext';
import { LogEvent } from '../lib/log';

export function useError(): void {
  const { logEvent } = useContext(LogContext);

  useEffect(() => {
    if (logEvent) {
      window.onerror = (msg, url, line, col, error) => {
        logEvent({
          event_name: LogEvent.GlobalError,
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
  }, [logEvent]);
}
