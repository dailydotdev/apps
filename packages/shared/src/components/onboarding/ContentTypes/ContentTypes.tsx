import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import useFeedSettings from '../../../hooks/useFeedSettings';

import { useAdvancedSettings } from '../../../hooks';
import {
  getAdvancedContentTypes,
  getContentCurationList,
  getContentSourceList,
} from '../../filters/helpers';
import { CardCheckbox } from '../../fields/CardCheckbox';
import { TOGGLEABLE_TYPES } from '../../feeds/FeedSettings/sections/FeedSettingsContentPreferencesSection';

interface ContentTypesProps {
  headline?: string;
}

export const ContentTypes = ({ headline }: ContentTypesProps): ReactElement => {
  const { advancedSettings } = useFeedSettings();
  const {
    selectedSettings,
    onToggleSettings,
    checkSourceBlocked,
    onToggleSource,
  } = useAdvancedSettings();

  const contentSourceList = useMemo(
    () => getContentSourceList(advancedSettings),
    [advancedSettings],
  );

  const contentCurationList = useMemo(
    () => getContentCurationList(advancedSettings),
    [advancedSettings],
  );

  const contentCurationAndVideoList = useMemo(() => {
    const listedTypes = getAdvancedContentTypes(
      TOGGLEABLE_TYPES,
      advancedSettings,
    );

    return contentCurationList.concat(listedTypes);
  }, [contentCurationList, advancedSettings]);

  const classes = '!h-[8.25rem] max-w-80';

  return (
    <div className="flex flex-col">
      <h2 className="typo-bold mb-10 text-center typo-large-title">
        {headline || 'What kind of posts would you like to see on your feed?'}
      </h2>
      <div className="m-auto grid grid-cols-1 gap-2 tablet:grid-cols-2 tablet:gap-5 laptop:grid-cols-3">
        {contentSourceList?.map(({ id, title, description, options }) => (
          <CardCheckbox
            key={id}
            className={classes}
            onCheckboxToggle={() => onToggleSource(options.source)}
            checked={!checkSourceBlocked(options.source)}
            title={title}
            description={description}
            inputProps={{
              checked: !checkSourceBlocked(options.source),
              name: `advancedSettings-${id}`,
            }}
          />
        ))}
        {contentCurationAndVideoList.map(
          ({ id, title, description, defaultEnabledState }) => (
            <CardCheckbox
              key={id}
              className={classes}
              onCheckboxToggle={() => onToggleSettings(id, defaultEnabledState)}
              checked={selectedSettings[id] ?? defaultEnabledState}
              title={title}
              description={description}
              inputProps={{
                checked: selectedSettings[id] ?? defaultEnabledState,
                name: `advancedSettings-${id}`,
              }}
            />
          ),
        )}
      </div>
    </div>
  );
};
