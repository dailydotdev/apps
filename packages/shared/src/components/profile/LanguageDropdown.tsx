import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { Dropdown, DropdownClassName } from '../fields/Dropdown';
import { LanguageIcon } from '../icons';
import { BaseFieldProps } from '../fields/BaseFieldContainer';
import { ContentLanguage, contnetLanguageToLabelMap } from '../../lib/user';
import { withExperiment } from '../withExperiment';
import { feature } from '../../lib/featureManagement';

type ClassName = {
  hint?: string;
  dropdown?: string;
} & DropdownClassName;

type Props = {
  className?: ClassName;
  defaultValue?: ContentLanguage;
  onChange?: (value: ContentLanguage, index: number) => void;
} & Pick<BaseFieldProps, 'name' | 'valid' | 'hint' | 'saveHintSpace'>;

const LanguageDropdownDefault = ({
  className = {},
  onChange,
  hint = '',
  valid = true,
  defaultValue,
  name,
  saveHintSpace = false,
}: Props): ReactElement => {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(
    defaultValue ? Object.values(ContentLanguage).indexOf(defaultValue) : 0,
  );

  const {
    hint: hintClassName,
    label: labelClassName,
    button: buttonClassName,
    menu: menuClassName,
    item: itemClassName,
    container: containerClassName,
    dropdown: dropdownClassName,
  } = className;

  return (
    <div
      className={classNames(
        'relative flex flex-col items-stretch',
        containerClassName,
      )}
    >
      <Dropdown
        className={{
          label: classNames(labelClassName, 'typo-body'),
          button: classNames(
            buttonClassName,
            '!px-3',
            !open &&
              !valid &&
              '!shadow-[inset_0.125rem_0_0_var(--status-error)]',
            selectedIndex > -1 && '!text-text-primary',
          ),
          menu: classNames(
            menuClassName,
            'menu-primary max-h-[15.375rem] overflow-y-auto p-1',
          ), // fit 6 items
          item: classNames(itemClassName, '*:min-h-10 *:!typo-callout'),
          container: dropdownClassName,
        }}
        selectedIndex={selectedIndex}
        options={Object.values(contnetLanguageToLabelMap)}
        onChange={(_, index) => {
          const val = Object.values(ContentLanguage)[index];
          onChange?.(val, index);
          setSelectedIndex(index);
        }}
        onOpenChange={setOpen}
        placeholder="Preferred language"
        icon={<LanguageIcon className="ml-0 mr-1" />}
      />
      {name && selectedIndex > -1 && (
        <input
          type="text"
          className="hidden"
          name={name}
          value={Object.values(ContentLanguage)[selectedIndex]}
          readOnly
        />
      )}
      {(hint?.length > 0 || saveHintSpace) && (
        <div
          role={!valid ? 'alert' : undefined}
          className={classNames(
            'mt-1 px-2 typo-caption1',
            !valid ? 'text-status-error' : 'text-text-quaternary',
            saveHintSpace && 'h-4',
            hintClassName,
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
};

export const LanguageDropdown = withExperiment(LanguageDropdownDefault, {
  feature: feature.postTitleLanguage,
  value: true,
});
