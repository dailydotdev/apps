import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { useSpotlight } from './SpotlightContext';
import type {
  SpotlightCloseDetails,
  SpotlightCommand,
  SpotlightCommandRunDetails,
  SpotlightResultsImpressionDetails,
} from './types';

const Spotlight = dynamic(
  () => import(/* webpackChunkName: "spotlight" */ './Spotlight'),
  { ssr: false },
);

/**
 * Mounts the Spotlight dialog globally and owns its telemetry. The dialog
 * itself stays log-free and reports through the callbacks below so the
 * Spotlight context never depends on the logging stack.
 */
export const SpotlightHost = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { isOpen, close } = useSpotlight();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.Spotlight,
    });
  }, [isOpen, logEvent]);

  const handleOpenViaShortcut = useCallback(() => {
    logEvent({
      event_name: LogEvent.KeyboardShortcutTriggered,
      target_id: TargetId.SpotlightOpen,
    });
  }, [logEvent]);

  const handleCommandRun = useCallback(
    (command: SpotlightCommand, details: SpotlightCommandRunDetails) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.SpotlightCommand,
        target_id: command.id,
        extra: JSON.stringify({
          search_id: details.searchId,
          query: details.query,
          scope: details.scope,
          provider: command.meta?.kind,
          group: command.group,
          position: details.position,
          search_version: details.searchVersion,
          had_results: details.hadResults,
          ...(details.fallthrough && { fallthrough: true }),
        }),
      });
    },
    [logEvent],
  );

  const handleResultsImpression = useCallback(
    (details: SpotlightResultsImpressionDetails) => {
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.SpotlightCommand,
        extra: JSON.stringify({
          search_id: details.searchId,
          query: details.query,
          scope: details.scope,
          result_count: details.resultCount,
          counts: details.counts,
          search_version: details.searchVersion,
        }),
      });
    },
    [logEvent],
  );

  const handleCloseLog = useCallback(
    (details: SpotlightCloseDetails) => {
      logEvent({
        event_name: LogEvent.CloseSearch,
        target_type: TargetType.Spotlight,
        extra: JSON.stringify({
          search_id: details.searchId,
          query: details.query,
          scope: details.scope,
          result_count: details.resultCount,
          had_results: details.hadResults,
          ran_command: details.ranCommand,
          time_open_ms: details.timeOpenMs,
          search_version: details.searchVersion,
        }),
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
      onResultsImpression={handleResultsImpression}
      onCloseLog={handleCloseLog}
    />
  );
};

export default SpotlightHost;
