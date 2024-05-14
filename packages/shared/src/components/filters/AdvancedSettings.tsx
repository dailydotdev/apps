import React, { ReactElement, useCallback, useMemo } from 'react';
import useFeedSettings from '../../hooks/useFeedSettings';
import { FilterSwitch } from './FilterSwitch';
import { AdvancedSettingsGroup } from '../../graphql/feedSettings';
import { useAdvancedSettings } from '../../hooks/feed';
import useTagAndSource from '../../hooks/useTagAndSource';
import { Origin } from '../../lib/analytics';
import { Source } from '../../graphql/sources';

const ADVANCED_SETTINGS_KEY = 'advancedSettings';

function AdvancedSettingsFilter(): ReactElement {
  const { advancedSettings, isLoading, feedSettings } = useFeedSettings();
  const { selectedSettings, onToggleSettings } = useAdvancedSettings();
  const sourceList = useMemo(
    () =>
      advancedSettings?.filter(
        ({ group }) => group === AdvancedSettingsGroup.ContentSource,
      ) ?? [],
    [advancedSettings],
  );
  const settingsList = useMemo(
    () =>
      advancedSettings?.filter(
        ({ group }) => group === AdvancedSettingsGroup.ContentCuration,
      ) ?? [],
    [advancedSettings],
  );

  const checkSourceBlocked = useCallback(
    (source: Source): boolean => {
      const blockedSources = feedSettings?.excludeSources ?? [];
      return blockedSources.some(({ id }) => id === source.id);
    },
    [feedSettings?.excludeSources],
  );

  const { onFollowSource, onUnfollowSource } = useTagAndSource({
    origin: Origin.SourcePage,
  });

  const onToggleSource = useCallback(
    (source: Source) => {
      if (checkSourceBlocked(source)) {
        onFollowSource({ source });
      } else {
        onUnfollowSource({ source });
      }
    },
    [checkSourceBlocked, onFollowSource, onUnfollowSource],
  );

  return (
    <section className="flex flex-col px-6" aria-busy={isLoading}>
      {sourceList?.map(({ id, title, description, options }) => (
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
