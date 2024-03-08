import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { VIcon } from '../icons';
import { IconSize } from '../Icon';
import type { SelectParams } from './common';

interface ListDrawerItemProps {
  value: string;
  isSelected: boolean;
  onClick: (params: Omit<SelectParams, 'index'>) => void;
}

export function ListDrawerItem({
  value,
  onClick,
  isSelected,
}: ListDrawerItemProps): ReactElement {
  return (
    <button
      key={value}
      role="menuitem"
      type="button"
      className={classNames(
        'flex h-10 flex-row items-center overflow-hidden text-ellipsis whitespace-nowrap px-2 typo-callout',
        isSelected ? 'font-bold' : 'text-theme-label-tertiary',
      )}
      onClick={(event) => onClick({ value, event })}
    >
      {value}
      {isSelected && (
        <VIcon secondary size={IconSize.Small} className="ml-auto" />
      )}
    </button>
  );
}
