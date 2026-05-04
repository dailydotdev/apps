import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetId } from '../../lib/log';
import { useSpotlight } from './useSpotlight';
import type { SpotlightCommand } from './types';

const Spotlight = dynamic(
  () => import(/* webpackChunkName: "spotlight" */ './Spotlight'),
  { ssr: false },
);

/**
 * Mounts the Spotlight dialog globally. Exposes the analytics callbacks so
 * the registry stays decoupled from the host's `useLogContext`. The global
 * Cmd+K listener is owned by the Spotlight component itself, so this host
 * just renders the dialog and wires telemetry.
 */
export const SpotlightHost = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { isOpen, close } = useSpotlight();

  const handleOpenViaShortcut = useCallback(() => {
    logEvent({
      event_name: LogEvent.KeyboardShortcutTriggered,
      target_id: TargetId.SpotlightOpen,
    });
    logEvent({
      event_name: LogEvent.Impression,
      target_id: 'spotlight_open',
    });
  }, [logEvent]);

  const handleCommandRun = useCallback(
    (command: SpotlightCommand) => {
      logEvent({
        event_name: LogEvent.Click,
        target_id: `spotlight_${command.id}`,
      });
    },
    [logEvent],
  );

  const handleQueryChange = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) {
        return;
      }
      logEvent({
        event_name: LogEvent.SubmitSearch,
        target_id: 'spotlight_query',
        extra: JSON.stringify({ query_length: trimmed.length }),
      });
    },
    [logEvent],
  );

  const showShortcutsHelp = useCallback(() => {
    // The actual help screen is rendered inside `Spotlight`. This callback
    // exists so the registry's "Show keyboard shortcuts" command has a
    // hook for analytics if we want to log help opens later.
  }, []);

  return (
    <Spotlight
      isOpen={isOpen}
      onClose={close}
      showShortcutsHelp={showShortcutsHelp}
      onCommandRun={handleCommandRun}
      onQueryChange={handleQueryChange}
      onOpenViaShortcut={handleOpenViaShortcut}
    />
  );
};

export default SpotlightHost;
