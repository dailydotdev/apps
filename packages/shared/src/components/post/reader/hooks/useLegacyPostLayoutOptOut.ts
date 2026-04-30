import { useCallback } from 'react';
import { useSettingsContext } from '../../../../contexts/SettingsContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent, TargetId } from '../../../../lib/log';

export function useLegacyPostLayoutOptOut(): {
  isOptedOut: boolean;
  optOut: () => void;
  optIn: () => void;
} {
  const { flags, updateFlag } = useSettingsContext();
  const { logEvent } = useLogContext();
  const isOptedOut = flags?.legacyPostLayoutOptOut ?? false;

  const optOut = useCallback(() => {
    updateFlag('legacyPostLayoutOptOut', true);
    logEvent({
      event_name: LogEvent.ToggleEmbeddedReader,
      target_id: TargetId.Off,
    });
  }, [logEvent, updateFlag]);

  const optIn = useCallback(() => {
    updateFlag('legacyPostLayoutOptOut', false);
    logEvent({
      event_name: LogEvent.ToggleEmbeddedReader,
      target_id: TargetId.On,
    });
  }, [logEvent, updateFlag]);

  return { isOptedOut, optOut, optIn };
}
