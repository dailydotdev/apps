import React, { ReactElement, useContext, useEffect, useState } from 'react';
import AuthContext from '../../contexts/AuthContext';
import useFeedSettings from '../../hooks/useFeedSettings';
import useMutateFilters from '../../hooks/useMutateFilters';
import { LoginModalMode } from '../../types/LoginModalMode';
import { Switch } from '../fields/Switch';

const advancedSettingsKey = 'advancedSettings';

function AdvancedSettingsFilter(): ReactElement {
  const [settings, setSettings] = useState({});
  const { feedSettings, advancedSettings, isLoading } = useFeedSettings();
  const { user, showLogin } = useContext(AuthContext);
  const { updateAdvancedSettings } = useMutateFilters(user);

  const onToggle = async (id: number) => {
    if (!user) {
      showLogin('configure advanced settings', LoginModalMode.ContentQuality);
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
      {advancedSettings?.map(({ id, title, description }, i) => (
        <div key={title} className="flex flex-col my-4">
          <Switch
            checked={settings[id]}
            defaultTypo={false}
            labelClassName="typo-callout"
            name={advancedSettingsKey}
            inputId={`${advancedSettingsKey}-${i}`}
            onToggle={() => onToggle(id)}
          >
            {title}
          </Switch>
          <p className="mt-3 typo-callout text-theme-label-tertiary">
            {description}
          </p>
        </div>
      ))}
    </section>
  );
}

export default AdvancedSettingsFilter;
