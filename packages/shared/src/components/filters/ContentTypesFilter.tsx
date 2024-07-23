import React, { ReactElement } from 'react';
import { FilterCheckbox } from '../fields/FilterCheckbox';
import { useAdvancedSettings } from '../../hooks/feed';
import useFeedSettings from '../../hooks/useFeedSettings';
import { getVideoSetting } from './helpers';

export function ContentTypesFilter(): ReactElement {
  const { advancedSettings, isLoading } = useFeedSettings();
  const { selectedSettings, onToggleSettings } = useAdvancedSettings();

  const videoSetting = getVideoSetting(advancedSettings);

  return (
    <section className="flex flex-col gap-6 px-6" aria-busy={isLoading}>
      {videoSetting && (
        <FilterCheckbox
          name={videoSetting.title}
          description={videoSetting.description}
          checked={
            selectedSettings[videoSetting.id] ??
            videoSetting.defaultEnabledState
          }
          onToggle={() =>
            onToggleSettings(videoSetting.id, videoSetting.defaultEnabledState)
          }
        >
          {videoSetting.title}
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
