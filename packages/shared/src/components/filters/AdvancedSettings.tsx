import React, { ReactElement, useContext, useMemo } from 'react';
import AlertContext from '../../contexts/AlertContext';
import AuthContext from '../../contexts/AuthContext';
import useFeedSettings from '../../hooks/useFeedSettings';
import useMutateFilters from '../../hooks/useMutateFilters';
import { LoginModalMode } from '../../types/LoginModalMode';
import { FilterSwitch } from './FilterSwitch';

const ADVANCED_SETTINGS_KEY = 'advancedSettings';

function AdvancedSettingsFilter(): ReactElement {
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

  const onToggle = async (id: number) => {
    if (!user) {
      showLogin('advanced settings', LoginModalMode.ContentQuality);
      return;
    }

    if (alerts?.filter) {
      disableFilterAlert();
    }

    await updateAdvancedSettings({
      advancedSettings: [{ id, enabled: !settings[id] }],
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
