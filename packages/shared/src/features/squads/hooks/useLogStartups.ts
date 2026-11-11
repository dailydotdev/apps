import { useCallback } from 'react';
import { useLogContext } from '../../../contexts/LogContext';
import type { LogEvent } from '../../../lib/log';
import { TargetType } from '../../../lib/log';

type LogStartups = (
  event: LogEvent,
  targetId?: string,
  extra?: Record<string, unknown>,
) => void;

/** Logs a daily.dev for Startups event, all under the `startups` target type */
export const useLogStartups = (): LogStartups => {
  const { logEvent } = useLogContext();

  return useCallback<LogStartups>(
    (event, targetId, extra) =>
      logEvent({
        event_name: event,
        target_type: TargetType.Startups,
        target_id: targetId,
        extra: extra ? JSON.stringify(extra) : undefined,
      }),
    [logEvent],
  );
};
