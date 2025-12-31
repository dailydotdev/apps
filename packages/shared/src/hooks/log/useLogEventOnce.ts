import { useEffect, useRef } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import type { LogEvent } from './useLogQueue';

export type UseLogEventOnceOptions = {
  /**
   * Condition that must be true for the event to be logged.
   * Defaults to true.
   */
  condition?: boolean;
};

/**
 * Hook to log an event exactly once, following React best practices.
 *
 * Uses a ref to track whether the event has been logged, allowing proper
 * dependency tracking without eslint-disable comments.
 *
 * @param getEvent - Function that returns the event to log. Called only when actually logging.
 * @param options - Optional configuration
 * @param options.condition - When true and not yet logged, the event will be logged. Defaults to true.
 *
 * @example
 * // Log once on mount
 * useLogEventOnce(() => ({
 *   event_name: LogEvent.StartAddExperience,
 *   target_type: type,
 * }));
 *
 * @example
 * // Log once when condition becomes true
 * useLogEventOnce(
 *   () => ({
 *     event_name: LogEvent.StartAddExperience,
 *     target_type: type,
 *   }),
 *   { condition: isNewExperience }
 * );
 */
const useLogEventOnce = (
  getEvent: () => LogEvent,
  options?: UseLogEventOnceOptions,
): void => {
  const { logEvent } = useLogContext();
  const hasLoggedRef = useRef(false);
  const getEventRef = useRef(getEvent);

  getEventRef.current = getEvent;

  const { condition = true } = options ?? {};

  useEffect(() => {
    if (condition && !hasLoggedRef.current) {
      hasLoggedRef.current = true;
      logEvent(getEventRef.current());
    }
  }, [condition, logEvent]);
};

export default useLogEventOnce;
