import React, { ReactElement } from 'react';
import { FilterSwitch } from './FilterSwitch';
import { useAdvancedSettings } from '../../hooks/feed';
import useFeedSettings from '../../hooks/useFeedSettings';

export function ContentTypesFilter(): ReactElement {
  const { advancedSettings, isLoading } = useFeedSettings();
  const { selectedSettings, onToggleSettings } = useAdvancedSettings();
  const videos = advancedSettings.find(({ title }) => title === 'Videos');

  return (
    <section className="flex flex-col px-6" aria-busy={isLoading}>
      <FilterSwitch
        name={videos.title}
        label={videos.title}
        inputId={videos.title}
        description={videos.description}
        checked={selectedSettings[videos.id] ?? videos.defaultEnabledState}
        onToggle={() => onToggleSettings(videos.id, videos.defaultEnabledState)}
      />
      <FilterSwitch
        name="Articles"
        label="Articles"
        inputId="Articles"
        description="Show article posts on my feed"
        disabled
        checked
      />
    </section>
  );
}
