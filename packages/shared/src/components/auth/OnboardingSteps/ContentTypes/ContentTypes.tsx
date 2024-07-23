import React, { ReactElement, useMemo } from 'react';
import useFeedSettings from '../../../../hooks/useFeedSettings';

import { useAdvancedSettings } from '../../../../hooks';
import { CustomCheckbox } from './CustomCheckbox';
import {
  getContentCurationList,
  getContentSourceList,
  getVideoSetting,
} from '../../../filters/helpers';

export const ContentTypes = (): ReactElement => {
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

  const videoSetting = getVideoSetting(advancedSettings);

  const contentCurationAndVideoList = useMemo(() => {
    if (videoSetting) {
      return [...contentCurationList, videoSetting];
    }
    return contentCurationList;
  }, [contentCurationList, videoSetting]);

  return (
    <div className="flex max-w-screen-laptop flex-col tablet:px-10">
      <h2 className="typo-bold mb-10 text-center typo-large-title">
        What kind of posts would you like to see on your feed?
      </h2>
      <div className="m-auto grid grid-cols-1 gap-2 tablet:grid-cols-2 tablet:gap-5 laptop:grid-cols-3">
        {contentSourceList?.map(({ id, title, description, options }) => (
          <CustomCheckbox
            key={id}
            name={`advancedSettings-${id}`}
            onCheckboxToggle={() => onToggleSource(options.source)}
            checked={!checkSourceBlocked(options.source)}
            title={title}
            description={description}
          />
        ))}
        {contentCurationAndVideoList.map(
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
