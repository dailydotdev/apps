import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { useSpotlight } from './SpotlightContext';
import type { SpotlightCommand } from './types';

const Spotlight = dynamic(
  () => import(/* webpackChunkName: "spotlight" */ './Spotlight'),
  { ssr: false },
);

/**
 * Mounts the Spotlight dialog globally and owns its telemetry. Impression
 * logs once per session via {@link useLogEventOnce}; per-command engagement
 * is tracked separately via the click event below.
 */
export const SpotlightHost = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { isOpen, close } = useSpotlight();

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.Spotlight,
    }),
    { condition: isOpen },
  );

  const handleOpenViaShortcut = useCallback(() => {
    logEvent({
      event_name: LogEvent.KeyboardShortcutTriggered,
      target_id: TargetId.SpotlightOpen,
    });
  }, [logEvent]);

  const handleCommandRun = useCallback(
    (command: SpotlightCommand) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.SpotlightCommand,
        target_id: command.id,
      });
    },
    [logEvent],
  );

  return (
    <Spotlight
      isOpen={isOpen}
      onClose={close}
      onCommandRun={handleCommandRun}
      onOpenViaShortcut={handleOpenViaShortcut}
    />
  );
};

export default SpotlightHost;
