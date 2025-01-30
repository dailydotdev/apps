import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import type { DropdownClassName } from '../fields/Dropdown';
import { Dropdown } from '../fields/Dropdown';
import { LanguageIcon } from '../icons';
import type { BaseFieldProps } from '../fields/BaseFieldContainer';
import type { IconProps } from '../Icon';
import { featureValidLanguages } from '../../lib/featureManagement';
import { useFeature } from '../GrowthBookProvider';

type ClassName = {
  hint?: string;
  dropdown?: string;
} & DropdownClassName;

type Props = {
  className?: ClassName;
  defaultValue?: string;
  onChange?: (value: string, index: number) => void;
  icon?: ReactElement<IconProps>;
} & Pick<BaseFieldProps, 'name' | 'valid' | 'hint' | 'saveHintSpace'>;

const defaultIcon = <LanguageIcon className="ml-0 mr-1" />;

export const LanguageDropdown = ({
  className = {},
  onChange,
  hint = '',
  valid = true,
  defaultValue,
  name,
  saveHintSpace = false,
  icon = defaultIcon,
}: Props): ReactElement => {
  const [open, setOpen] = useState(false);
  const validLanguages = useFeature(featureValidLanguages);
  const languageOptions = useMemo(() => {
    return ['Original language', ...Object.values(validLanguages)];
  }, [validLanguages]);
  const values = useMemo(() => {
    return [null, ...Object.keys(validLanguages)];
  }, [validLanguages]);
  const [selectedIndex, setSelectedIndex] = useState(
    defaultValue ? values.indexOf(defaultValue) : 0,
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
            selectedIndex > 0 && '!text-text-primary',
          ),
          menu: classNames(
            menuClassName,
            'menu-primary max-h-[15.375rem] overflow-y-auto p-1',
          ), // fit 6 items
          item: classNames(itemClassName, '*:min-h-10 *:!typo-callout'),
          container: dropdownClassName,
        }}
        selectedIndex={selectedIndex}
        options={languageOptions}
        onChange={(_, index) => {
          const val = values[index];
          onChange?.(val, index);
          setSelectedIndex(index);
        }}
        onOpenChange={setOpen}
        placeholder="Preferred content language"
        icon={icon}
      />
      {name && selectedIndex > -1 && (
        <input
          type="text"
          className="hidden"
          name={name}
          value={values[selectedIndex]}
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
