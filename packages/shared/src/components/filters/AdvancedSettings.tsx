import React, { ReactElement, useMemo } from 'react';
import useFeedSettings from '../../hooks/useFeedSettings';
import { FilterSwitch } from './FilterSwitch';
import { AdvancedSettingsGroup } from '../../graphql/feedSettings';
import { useAdvancedSettings } from '../../hooks/feed';

const ADVANCED_SETTINGS_KEY = 'advancedSettings';

function AdvancedSettingsFilter(): ReactElement {
  const { advancedSettings, isLoading } = useFeedSettings();
  const { selectedSettings, onToggleSettings } = useAdvancedSettings();
  const settingsList = useMemo(
    () =>
      advancedSettings?.filter(
        ({ group }) => group === AdvancedSettingsGroup.Advanced,
      ) ?? [],
    [advancedSettings],
  );

  return (
    <section className="flex flex-col px-6" aria-busy={isLoading}>
      {settingsList?.map(({ id, title, description, defaultEnabledState }) => (
        <FilterSwitch
          key={id}
          label={title}
          name={`${ADVANCED_SETTINGS_KEY}-${id}`}
          inputId={`${ADVANCED_SETTINGS_KEY}-${id}`}
          checked={selectedSettings[id] ?? defaultEnabledState}
          description={description}
          onToggle={() => onToggleSettings(id, defaultEnabledState)}
        />
      ))}
    </section>
  );
}

export default AdvancedSettingsFilter;
