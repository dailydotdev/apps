import React, { ReactElement } from 'react';
import { FilterCheckbox } from '../fields/FilterCheckbox';
import { useAdvancedSettings } from '../../hooks/feed';
import useFeedSettings from '../../hooks/useFeedSettings';

export function ContentTypesFilter(): ReactElement {
  const { advancedSettings, isLoading } = useFeedSettings();
  const { selectedSettings, onToggleSettings } = useAdvancedSettings();
  /*
   * At the moment, we are only referencing the Video entity, but it should be based from the group that it is in.
   * Point being, we have to send multiple mutation requests at the same time if the user toggles the switch.
   * We should instead introduce a new mutation to handle an array of settings to toggle.
   * */
  const videos = advancedSettings?.find(({ title }) => title === 'Videos');

  return (
    <section className="flex flex-col gap-6 px-6" aria-busy={isLoading}>
      {videos && (
        <FilterCheckbox
          name={videos.title}
          description={videos.description}
          checked={selectedSettings[videos.id] ?? videos.defaultEnabledState}
          onToggle={() =>
            onToggleSettings(videos.id, videos.defaultEnabledState)
          }
        >
          {videos.title}
        </FilterCheckbox>
      )}
      <FilterCheckbox
        name="Articles"
        description="Show article posts on my feed"
        disabled
        checked
      >
        Articles
      </FilterCheckbox>
    </section>
  );
}
