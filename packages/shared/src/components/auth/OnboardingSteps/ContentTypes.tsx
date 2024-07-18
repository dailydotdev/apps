import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Checkbox } from '../../fields/Checkbox';
import useFeedSettings from '../../../hooks/useFeedSettings';

import { useAdvancedSettings } from '../../../hooks';

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

export const ContentTypes = (): ReactElement => {
  const { contentSourceList, contentCurationList, videoSetting } =
    useFeedSettings();
  const {
    selectedSettings,
    onToggleSettings,
    checkSourceBlocked,
    onToggleSource,
  } = useAdvancedSettings();

  return (
    <div className="flex max-w-[63.75rem] flex-col tablet:px-10">
      <h2 className="typo-bold mb-10 text-center typo-large-title">
        What kind of posts would you like to see on your feed?
      </h2>
      <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2 laptop:grid-cols-3">
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
        {[...contentCurationList, videoSetting]?.map(
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
