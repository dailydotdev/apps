import React, { ReactElement, useContext, useMemo } from 'react';
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
  const settings = useMemo(
    () =>
      feedSettings?.advancedSettings?.reduce((settingsMap, currentSettings) => {
        const map = { ...settingsMap };
        map[currentSettings.id] = currentSettings.enabled;
        return map;
      }, {}),
    [feedSettings?.advancedSettings],
  );

  const onToggle = async (id: number) => {
    if (!user) {
      showLogin('advanced settings', LoginModalMode.ContentQuality);
      return;
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
            title={title}
            checked={settings[id] ?? defaultEnabledState}
            name={ADVANCED_SETTINGS_KEY}
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
