import request from 'graphql-request';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import AuthContext from '../../contexts/AuthContext';
import {
  AdvancedSettings,
  FeedSettingsData,
  FEED_ADVANCED_SETTINGS_AND_LIST,
} from '../../graphql/feedSettings';
import useMutateFilters from '../../hooks/useMutateFilters';
import { apiUrl } from '../../lib/config';
import { LoginModalMode } from '../../types/LoginModalMode';
import { Switch } from '../fields/Switch';

const advancedSettings = 'advancedSettings';

function AdvancedSettingsFilter(): ReactElement {
  const { user, showLogin } = useContext(AuthContext);
  const { updateAdvancedSettings } = useMutateFilters();
  const [settingsMap, setSettingsMap] = useState<Record<number, boolean>>({});
  const { data, isLoading } = useQuery<
    FeedSettingsData & { advancedSettings: AdvancedSettings[] }
  >(advancedSettings, () =>
    request(`${apiUrl}/graphql`, FEED_ADVANCED_SETTINGS_AND_LIST, {
      loggedIn: !!user,
    }),
  );

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
    if (!data?.feedSettings?.advancedSettings) {
      return;
    }

    const map = {};

    data.feedSettings?.advancedSettings?.forEach(
      // eslint-disable-next-line no-return-assign
      (settings) => (map[settings.id] = settings.enabled),
    );

    setSettingsMap(map);
  }, [data?.feedSettings?.advancedSettings]);

  return (
    <section className="flex flex-col px-6" aria-busy={isLoading}>
      {data?.advancedSettings.map((option, i) => (
        <div key={option.title} className="flex flex-col my-4">
          <Switch
            checked={settingsMap[option.id]}
            defaultTypo={false}
            labelClassName="typo-callout"
            name={advancedSettings}
            inputId={`${advancedSettings}-${i}`}
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
