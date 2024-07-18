import React, { ReactElement, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { Checkbox } from '../../fields/Checkbox';
import useFeedSettings from '../../../hooks/useFeedSettings';
import {
  AdvancedSettings,
  AdvancedSettingsGroup,
} from '../../../graphql/feedSettings';
import { useAdvancedSettings } from '../../../hooks';
import { Source } from '../../../graphql/sources';
import useTagAndSource from '../../../hooks/useTagAndSource';
import { Origin } from '../../../lib/log';

const CustomCheckbox = ({
  checked,
  title,
  description,
  onCheckboxToggle,
  name,
}: {
  checked: boolean;
  title: string;
  description: string;
  onCheckboxToggle: () => void;
  name: string;
}) => {
  return (
    <button
      type="button"
      className={classNames(
        'h-[8.25rem] max-w-80 cursor-pointer rounded-16 border p-4 text-left',
        checked
          ? 'border-accent-cabbage-bolder bg-surface-float text-text-primary'
          : 'text-text-tertiary',
      )}
      onClick={onCheckboxToggle}
    >
      <div className="h-full">
        <div className="flex">
          <p className="mr-auto font-bold typo-title3">{title}</p>
          {checked && (
            <Checkbox
              className="pointer-events-none !p-0"
              checkmarkClassName="!mr-0"
              name={name}
              checked
            />
          )}
        </div>
        <p className="mt-1.5 typo-body">{description}</p>
      </div>
    </button>
  );
};
interface ContentTypesProps {
  // onClick: () => void;
}

export const ContentTypes = ({}: ContentTypesProps): ReactElement => {
  const { advancedSettings, feedSettings } = useFeedSettings();
  const { selectedSettings, onToggleSettings } = useAdvancedSettings();
  const sourceList = useMemo(
    () =>
      advancedSettings?.filter(
        ({ group }) => group === AdvancedSettingsGroup.ContentSource,
      ) ?? [],
    [advancedSettings],
  );
  const videos =
    advancedSettings?.find(({ title }) => title === 'Videos') ?? [];

  const settingsList = useMemo(
    () =>
      [
        ...(advancedSettings?.filter(
          ({ group }) => group === AdvancedSettingsGroup.ContentCuration,
        ) ?? []),
        videos,
      ] as AdvancedSettings[],
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
    <div className="flex max-w-[63.75rem] flex-col tablet:px-10">
      <h2 className="typo-bold mb-10 text-center typo-large-title">
        What kind of posts would you like to see on your feed?
      </h2>
      <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2 laptop:grid-cols-3">
        {sourceList?.map(({ id, title, description, options }) => (
          <CustomCheckbox
            key={id}
            name={`advancedSettings-${id}`}
            onCheckboxToggle={() => onToggleSource(options.source)}
            checked={!checkSourceBlocked(options.source)}
            title={title}
            description={description}
          />
        ))}
        {settingsList?.map(
          ({ id, title, description, defaultEnabledState }) => (
            <CustomCheckbox
              key={id}
              name={`advancedSettings-${id}`}
              onCheckboxToggle={() => onToggleSettings(id, defaultEnabledState)}
              checked={selectedSettings[id] ?? defaultEnabledState}
              title={title}
              description={description}
            />
          ),
        )}
      </div>
    </div>
  );
};
