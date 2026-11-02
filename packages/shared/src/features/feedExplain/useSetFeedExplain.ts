import { useCallback } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import type { Origin } from '../../lib/log';
import { LogEvent, TargetId } from '../../lib/log';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';

/**
 * Turns Explain mode on or off and logs where from, so every way in and out
 * of Debug is counted. Setting the state it is already in logs nothing.
 */
export const useSetFeedExplain = (
  origin: Origin,
): ((isExplaining: boolean) => void) => {
  const { logEvent } = useLogContext();
  const [isOn, setIsOn] = useQueryState({
    key: [QueryStateKeys.FeedExplain],
    defaultValue: false,
  });

  return useCallback(
    (isExplaining: boolean) => {
      if (isExplaining === isOn) {
        return;
      }
      logEvent({
        event_name: LogEvent.ToggleFeedExplain,
        target_id: isExplaining ? TargetId.On : TargetId.Off,
        extra: JSON.stringify({ origin }),
      });
      setIsOn(isExplaining);
    },
    [isOn, logEvent, origin, setIsOn],
  );
};
