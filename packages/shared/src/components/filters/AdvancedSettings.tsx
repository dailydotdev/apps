import React, { ReactElement } from 'react';
import useFeedSettings from '../../hooks/useFeedSettings';
import { FilterSwitch } from './FilterSwitch';
import { useAdvancedSettings } from '../../hooks/feed';

const ADVANCED_SETTINGS_KEY = 'advancedSettings';

function AdvancedSettingsFilter(): ReactElement {
  const { isLoading, contentSourceList, contentCurationList } =
    useFeedSettings();
  const {
    selectedSettings,
    onToggleSettings,
    checkSourceBlocked,
    onToggleSource,
  } = useAdvancedSettings();

  return (
    <section className="flex flex-col px-6" aria-busy={isLoading}>
      {contentSourceList?.map(({ id, title, description, options }) => (
        <FilterSwitch
          key={id}
          label={title}
          name={`${ADVANCED_SETTINGS_KEY}-${id}`}
          inputId={`${ADVANCED_SETTINGS_KEY}-${id}`}
          checked={!checkSourceBlocked(options.source)}
          description={description}
          onToggle={() => onToggleSource(options.source)}
        />
      ))}
      {contentCurationList?.map(
        ({ id, title, description, defaultEnabledState }) => (
          <FilterSwitch
            key={id}
            label={title}
            name={`${ADVANCED_SETTINGS_KEY}-${id}`}
            inputId={`${ADVANCED_SETTINGS_KEY}-${id}`}
            checked={selectedSettings[id] ?? defaultEnabledState}
            description={description}
            onToggle={() => onToggleSettings(id, defaultEnabledState)}
          />
        ),
      )}
    </section>
  );
}

export default AdvancedSettingsFilter;
