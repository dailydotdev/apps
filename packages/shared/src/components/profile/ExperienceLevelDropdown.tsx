import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Dropdown, DropdownClassName } from '../fields/Dropdown';
import { TerminalIcon } from '../icons';
import { BaseFieldProps } from '../fields/BaseFieldContainer';
import { UserExperienceLevel } from '../../lib/user';

interface ClassName extends DropdownClassName {
  hint?: string;
  dropdown?: string;
}

type UserExperienceLevelKey = keyof typeof UserExperienceLevel;

interface Props
  extends Pick<BaseFieldProps, 'name' | 'valid' | 'hint' | 'saveHintSpace'> {
  className?: ClassName;
  defaultValue?: UserExperienceLevelKey;
  onChange?: (value: UserExperienceLevelKey, index: number) => void;
}

const ExperienceLevelDropdown = ({
  className = {},
  onChange,
  hint = '',
  valid = true,
  defaultValue,
  name,
  saveHintSpace = false,
}: Props): ReactElement => {
  const [open, setOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(
    Object.keys(UserExperienceLevel).indexOf(defaultValue),
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
        options={Object.values(UserExperienceLevel)}
        onChange={(_, index) => {
          const val = Object.keys(UserExperienceLevel)[
            index
          ] as UserExperienceLevelKey;
          onChange?.(val, index);
          setSelectedIndex(index);
        }}
        onOpenChange={setOpen}
        placeholder="Experience level"
        icon={<TerminalIcon className="ml-0 mr-1" />}
      />
      {name && selectedIndex > -1 && (
        <input
          type="text"
          className="hidden"
          name={name}
          value={Object.keys(UserExperienceLevel)[selectedIndex]}
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

export default ExperienceLevelDropdown;
