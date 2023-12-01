import { useCallback, useMemo } from 'react';
import useFeedSettings from '../useFeedSettings';
import { useAlertsContext } from '../../contexts/AlertContext';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { useAuthContext } from '../../contexts/AuthContext';
import useMutateFilters from '../useMutateFilters';

interface UseAdvancedSettings {
  selectedSettings: Record<string, boolean>;
  onToggleSettings(id: number, state: boolean): void;
}

export const useAdvancedSettings = (): UseAdvancedSettings => {
  const { user } = useAuthContext();
  const { feedSettings } = useFeedSettings();
  const { trackEvent } = useAnalyticsContext();
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

  const onToggleSettings = useCallback(
    (id: number, defaultEnabledState: boolean) => {
      if (alerts?.filter && user) {
        updateAlerts({ filter: false });
      }

      const enabled = !(selectedSettings[id] ?? defaultEnabledState);

      trackEvent({
        event_name: `toggle ${enabled ? 'on' : 'off'}`,
        target_type: 'advanced setting',
        target_id: id.toString(),
        extra: JSON.stringify({ origin: 'advanced settings filter' }),
      });

      updateAdvancedSettings({
        advancedSettings: [{ id, enabled }],
      });
    },
    [
      alerts?.filter,
      selectedSettings,
      trackEvent,
      updateAdvancedSettings,
      updateAlerts,
      user,
    ],
  );

  return { selectedSettings, onToggleSettings };
};
