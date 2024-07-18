import React, { ReactElement } from 'react';
import { FilterCheckbox } from '../fields/FilterCheckbox';
import { useAdvancedSettings } from '../../hooks/feed';
import useFeedSettings from '../../hooks/useFeedSettings';

export function ContentTypesFilter(): ReactElement {
  const { videoSetting, isLoading } = useFeedSettings();
  const { selectedSettings, onToggleSettings } = useAdvancedSettings();

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
