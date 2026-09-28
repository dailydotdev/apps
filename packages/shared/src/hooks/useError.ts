import { useEffect } from 'react';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent } from '../lib/log';
import { onDomMutationGuarded } from '../lib/domMutationGuard';

export function useError(): void {
  const { logEvent } = useLogContext();

  useEffect(() => {
    if (!logEvent) {
      return undefined;
    }

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

    return onDomMutationGuarded((method) => {
      logEvent({
        event_name: LogEvent.GlobalError,
        extra: JSON.stringify({
          msg: `Skipped ${method}: the node is not a child of this node`,
          url: window.location.href,
          domMutation: true,
        }),
      });
    });
  }, [logEvent]);
}
