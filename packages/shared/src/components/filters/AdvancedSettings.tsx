import React, { ReactElement, useContext, useMemo } from 'react';
import AlertContext from '../../contexts/AlertContext';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import AuthContext from '../../contexts/AuthContext';
import useFeedSettings from '../../hooks/useFeedSettings';
import useMutateFilters from '../../hooks/useMutateFilters';
import { LoginModalMode } from '../../types/LoginModalMode';
import { FilterSwitch } from './FilterSwitch';

const ADVANCED_SETTINGS_KEY = 'advancedSettings';

function AdvancedSettingsFilter(): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const { feedSettings, advancedSettings, isLoading } = useFeedSettings();
  const { user, showLogin } = useContext(AuthContext);
  const { updateAdvancedSettings } = useMutateFilters(user);
  const { alerts, disableFilterAlert } = useContext(AlertContext);
  const settings = useMemo(
    () =>
      feedSettings?.advancedSettings?.reduce((settingsMap, currentSettings) => {
        const map = { ...settingsMap };
        map[currentSettings.id] = currentSettings.enabled;
        return map;
      }, {}) || {},
    [feedSettings?.advancedSettings],
  );

  const onToggle = (id: number) => {
    if (!user) {
      showLogin('advanced settings', LoginModalMode.ContentQuality);
      return;
    }

    if (alerts?.filter) {
      disableFilterAlert();
    }

    const enabled = !settings[id];
    const { title } = advancedSettings.find((adv) => adv.id === id);

    trackEvent({
      event_name: `toggle ${enabled ? 'on' : 'off'}`,
      target_type: 'advanced_settings',
      target_id: `${id}_${title}`,
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
            onToggle={() => onToggle(id)}
            inputId={`${ADVANCED_SETTINGS_KEY}-${id}`}
          />
        ),
      )}
    </section>
  );
}

export default AdvancedSettingsFilter;
