import React, { ReactElement, useContext, useMemo } from 'react';
import AlertContext from '../../contexts/AlertContext';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import AuthContext from '../../contexts/AuthContext';
import useFeedSettings from '../../hooks/useFeedSettings';
import useMutateFilters from '../../hooks/useMutateFilters';
import { useMyFeed } from '../../hooks/useMyFeed';
import { FilterSwitch } from './FilterSwitch';

const ADVANCED_SETTINGS_KEY = 'advancedSettings';

function AdvancedSettingsFilter(): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const { feedSettings, advancedSettings, isLoading } = useFeedSettings();
  const { user, showLogin } = useContext(AuthContext);
  const { updateAdvancedSettings } = useMutateFilters(user);
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { shouldShowMyFeed } = useMyFeed();
  const settings = useMemo(
    () =>
      feedSettings?.advancedSettings?.reduce((settingsMap, currentSettings) => {
        const map = { ...settingsMap };
        map[currentSettings.id] = currentSettings.enabled;
        return map;
      }, {}) || {},
    [feedSettings?.advancedSettings],
  );

  const onToggle = (id: number, defaultEnabledState: boolean) => {
    if (!shouldShowMyFeed && !user) {
      showLogin('advanced settings');
      return;
    }

    if (alerts?.filter && user) {
      updateAlerts({ filter: false });
    }

    const enabled = !(settings[id] ?? defaultEnabledState);

    trackEvent({
      event_name: `toggle ${enabled ? 'on' : 'off'}`,
      target_type: 'advanced setting',
      target_id: id.toString(),
      extra: JSON.stringify({ origin: 'advanced settings filter' }),
    });

    updateAdvancedSettings({
      advancedSettings: [{ id, enabled }],
    });
  };

  return (
    <section className="flex flex-col px-6" aria-busy={isLoading}>
      {advancedSettings?.map(
        ({ id, title, description, defaultEnabledState }) => (
          <FilterSwitch
            key={id}
            label={title}
            checked={settings[id] ?? defaultEnabledState}
            name={`${ADVANCED_SETTINGS_KEY}-${id}`}
            description={description}
            onToggle={() => onToggle(id, defaultEnabledState)}
            inputId={`${ADVANCED_SETTINGS_KEY}-${id}`}
          />
        ),
      )}
    </section>
  );
}

export default AdvancedSettingsFilter;
