import { useCallback, useMemo } from 'react';
import useFeedSettings, { UseFeedSettingsProps } from '../useFeedSettings';
import { useAlertsContext } from '../../contexts/AlertContext';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import useMutateFilters from '../useMutateFilters';

interface UseAdvancedSettings {
  selectedSettings: Record<string, boolean>;
  onToggleSettings(id: number, state: boolean): void;
  onUpdateSettings(id: number, state: boolean): void;
}

export const useAdvancedSettings = (
  props?: UseFeedSettingsProps,
): UseAdvancedSettings => {
  const { user } = useAuthContext();
  const { feedSettings } = useFeedSettings(props);
  const { trackEvent } = useLogContext();
  const { updateAdvancedSettings } = useMutateFilters(user);
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
    (id: number, enabled: boolean) => {
      trackEvent({
        event_name: `toggle ${enabled ? 'on' : 'off'}`,
        target_type: 'advanced setting',
        target_id: id.toString(),
        extra: JSON.stringify({ origin: 'advanced settings filter' }),
      });

      return updateAdvancedSettings({
        advancedSettings: [{ id, enabled }],
      });
    },
    [trackEvent, updateAdvancedSettings],
  );

  // We still need to support this function as this is used for experiments
  // and currently used in simpler implementations of updating the settings
  const onToggleSettings = useCallback(
    (id: number, defaultEnabledState: boolean) => {
      if (alerts?.filter && user) {
        updateAlerts({ filter: false });
      }

      const enabled = !(selectedSettings[id] ?? defaultEnabledState);

      return onUpdateSettings(id, enabled);
    },
    [alerts?.filter, selectedSettings, onUpdateSettings, updateAlerts, user],
  );

  return { selectedSettings, onToggleSettings, onUpdateSettings };
};
