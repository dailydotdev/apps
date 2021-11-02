import React, { ReactElement, useContext, useEffect, useState } from 'react';
import AuthContext from '../../contexts/AuthContext';
import useFeedSettings from '../../hooks/useFeedSettings';
import useMutateFilters from '../../hooks/useMutateFilters';
import { LoginModalMode } from '../../types/LoginModalMode';
import { FilterSwitch } from './FilterSwitch';

const ADVANCED_SETTINGS_KEY = 'advancedSettings';

function AdvancedSettingsFilter(): ReactElement {
  const [settings, setSettings] = useState({});
  const { feedSettings, advancedSettings, isLoading } = useFeedSettings();
  const { user, showLogin } = useContext(AuthContext);
  const { updateAdvancedSettings } = useMutateFilters(user);

  const onToggle = async (id: number) => {
    if (!user) {
      showLogin('advanced settings', LoginModalMode.ContentQuality);
      return;
    }

    await updateAdvancedSettings({
      advancedSettings: [{ id, enabled: !settings[id] }],
    });
  };

  useEffect(() => {
    if (!feedSettings?.advancedSettings) {
      return;
    }

    const map = {};
    feedSettings.advancedSettings.forEach(
      // eslint-disable-next-line no-return-assign
      ({ id, enabled }) => (map[id] = enabled),
    );
    setSettings(map);
  }, [feedSettings?.advancedSettings]);

  return (
    <section className="flex flex-col px-6" aria-busy={isLoading}>
      {advancedSettings?.map(({ id, title, description }) => (
        <FilterSwitch
          key={id}
          title={title}
          name={ADVANCED_SETTINGS_KEY}
          description={description}
          onToggle={() => onToggle(id)}
          inputId={`${ADVANCED_SETTINGS_KEY}-${id}`}
        />
      ))}
    </section>
  );
}

export default AdvancedSettingsFilter;
