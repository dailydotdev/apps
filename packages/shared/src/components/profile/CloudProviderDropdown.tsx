import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { DropdownClassName } from '../fields/Dropdown';
import { Dropdown } from '../fields/Dropdown';
import { EarthIcon } from '../icons';
import type { BaseFieldProps } from '../fields/BaseFieldContainer';
import { CloudProvider } from '../../lib/user';

interface ClassName extends DropdownClassName {
  hint?: string;
  dropdown?: string;
}

type CloudProviderKey = keyof typeof CloudProvider;

interface Props
  extends Pick<BaseFieldProps, 'name' | 'valid' | 'hint' | 'saveHintSpace'> {
  className?: ClassName;
  defaultValue?: CloudProviderKey;
  onChange?: (value: CloudProviderKey, index: number) => void;
}

const CloudProviderDropdown = ({
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
    Object.keys(CloudProvider).indexOf(defaultValue ?? ''),
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
          menu: classNames(menuClassName, 'menu-primary p-1'),
          item: classNames(itemClassName, '*:min-h-10 *:!typo-callout'),
          container: dropdownClassName,
        }}
        selectedIndex={selectedIndex}
        options={Object.values(CloudProvider)}
        onChange={(_, index) => {
          const val = Object.keys(CloudProvider)[index] as CloudProviderKey;
          onChange?.(val, index);
          setSelectedIndex(index);
        }}
        onOpenChange={setOpen}
        placeholder="Current cloud provider"
        icon={
          <EarthIcon aria-hidden role="presentation" className="ml-0 mr-1" />
        }
      />
      {name && selectedIndex > -1 && (
        <input
          type="text"
          className="hidden"
          name={name}
          value={Object.keys(CloudProvider)[selectedIndex]}
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

export default CloudProviderDropdown;
