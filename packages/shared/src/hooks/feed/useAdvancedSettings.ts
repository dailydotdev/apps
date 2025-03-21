import { useCallback, useMemo } from 'react';
import type { UseFeedSettingsProps } from '../useFeedSettings';
import useFeedSettings from '../useFeedSettings';
import { useAlertsContext } from '../../contexts/AlertContext';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import useMutateFilters from '../useMutateFilters';
import type { Source } from '../../graphql/sources';
import useTagAndSource from '../useTagAndSource';
import { Origin } from '../../lib/log';

interface UseAdvancedSettings {
  selectedSettings: Record<string, boolean>;
  onToggleSettings(id: number, state: boolean): void;
  onToggleSource(source: Source): void;
  onUpdateSettings(updatedSettings: { id: number; enabled: boolean }[]): void;
  checkSourceBlocked(source: Source): boolean;
}

export const useAdvancedSettings = (
  props?: UseFeedSettingsProps,
): UseAdvancedSettings => {
  const { user } = useAuthContext();
  const { feedSettings } = useFeedSettings(props);
  const { logEvent } = useLogContext();
  const { updateAdvancedSettings } = useMutateFilters(user, props?.feedId);
  const { alerts, updateAlerts } = useAlertsContext();

  const selectedSettings = useMemo(
    () =>
      feedSettings?.advancedSettings?.reduce((settingsMap, currentSettings) => {
        const map = { ...settingsMap };
        map[currentSettings.id] = currentSettings.enabled;
        return map;
      }, {}) || {},
    [feedSettings?.advancedSettings],
  );

  const onUpdateSettings = useCallback(
    (updatedSettings: { id: number; enabled: boolean }[]) => {
      updatedSettings.forEach(({ id, enabled }) => {
        logEvent({
          event_name: `toggle ${enabled ? 'on' : 'off'}`,
          target_type: 'advanced setting',
          target_id: id.toString(),
          extra: JSON.stringify({ origin: 'advanced settings filter' }),
        });
      });

      return updateAdvancedSettings({
        advancedSettings: updatedSettings,
      });
    },
    [logEvent, updateAdvancedSettings],
  );

  // We still need to support this function as this is used for experiments
  // and currently used in simpler implementations of updating the settings
  const onToggleSettings = useCallback(
    (id: number, defaultEnabledState: boolean) => {
      if (alerts?.filter && user) {
        updateAlerts({ filter: false });
      }

      const enabled = !(selectedSettings[id] ?? defaultEnabledState);

      return onUpdateSettings([{ id, enabled }]);
    },
    [alerts?.filter, selectedSettings, onUpdateSettings, updateAlerts, user],
  );

  const checkSourceBlocked = useCallback(
    (source: Source): boolean => {
      const blockedSources = feedSettings?.excludeSources ?? [];
      return blockedSources.some(({ id }) => id === source.id);
    },
    [feedSettings?.excludeSources],
  );

  const { onUnblockSource, onBlockSource } = useTagAndSource({
    origin: Origin.SourcePage,
    feedId: props?.feedId,
  });

  const onToggleSource = useCallback(
    (source: Source) => {
      if (checkSourceBlocked(source)) {
        onUnblockSource({ source });
      } else {
        onBlockSource({ source });
      }
    },
    [checkSourceBlocked, onBlockSource, onUnblockSource],
  );

  return {
    selectedSettings,
    onToggleSettings,
    onUpdateSettings,
    checkSourceBlocked,
    onToggleSource,
  };
};
