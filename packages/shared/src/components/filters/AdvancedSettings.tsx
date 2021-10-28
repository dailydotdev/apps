import React, { ReactElement, useContext, useEffect, useState } from 'react';
import AuthContext from '../../contexts/AuthContext';
import useFeedSettings from '../../hooks/useFeedSettings';
import useMutateFilters from '../../hooks/useMutateFilters';
import { LoginModalMode } from '../../types/LoginModalMode';
import { Switch } from '../fields/Switch';

const advancedSettingsKey = 'advancedSettings';

function AdvancedSettingsFilter(): ReactElement {
  const { feedSettings, advancedSettings, isLoading } = useFeedSettings();
  const { user, showLogin } = useContext(AuthContext);
  const { updateAdvancedSettings } = useMutateFilters();
  const [settingsMap, setSettingsMap] = useState<Record<number, boolean>>({});

  const onToggle = async (id: number) => {
    if (!user) {
      showLogin('add source', LoginModalMode.ContentQuality);
      return;
    }
    setSettingsMap((state) => ({
      ...state,
      [id]: !settingsMap[id],
    }));

    await updateAdvancedSettings({
      advancedSettings: [{ id, enabled: !settingsMap[id] }],
    });
  };

  useEffect(() => {
    if (!feedSettings?.advancedSettings) {
      return;
    }

    const map = {};

    feedSettings?.advancedSettings?.forEach(
      // eslint-disable-next-line no-return-assign
      (settings) => (map[settings.id] = settings.enabled),
    );

    setSettingsMap(map);
  }, [feedSettings?.advancedSettings]);

  return (
    <section className="flex flex-col px-6" aria-busy={isLoading}>
      {advancedSettings?.map((option, i) => (
        <div key={option.title} className="flex flex-col my-4">
          <Switch
            checked={settingsMap[option.id]}
            defaultTypo={false}
            labelClassName="typo-callout"
            name={advancedSettingsKey}
            inputId={`${advancedSettingsKey}-${i}`}
            onToggle={() => onToggle(option.id)}
          >
            {option.title}
          </Switch>
          <p className="mt-3 typo-callout text-theme-label-tertiary">
            {option.description}
          </p>
        </div>
      ))}
    </section>
  );
}

export default AdvancedSettingsFilter;
