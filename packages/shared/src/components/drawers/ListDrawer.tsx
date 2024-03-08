import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Drawer, DrawerRef, DrawerWrapperProps } from './Drawer';
import { VIcon } from '../icons';
import { IconSize } from '../Icon';
import { SelectParams } from './common';

interface ListDrawerProps {
  drawerProps: Omit<DrawerWrapperProps, 'children'>;
  options: string[];
  selected: number; // index
  onSelectedChange(props: SelectParams): void;
}

export function ListDrawer({
  onSelectedChange,
  drawerProps,
  selected,
  options,
}: ListDrawerProps): ReactElement {
  const ref = React.useRef<DrawerRef>();

  return (
    <Drawer {...drawerProps} ref={ref} role="menu">
      {options.map((value, index) => {
        const isSelected = index === selected;

        return (
          <button
            key={value}
            role="menuitem"
            type="button"
            className={classNames(
              'flex h-10 flex-row items-center overflow-hidden text-ellipsis whitespace-nowrap px-2 typo-callout',
              index === selected ? 'font-bold' : 'text-theme-label-tertiary',
            )}
            onClick={(event) => {
              onSelectedChange({ value, index, event });
              ref.current.onClose();
            }}
          >
            {value}
            {isSelected && (
              <VIcon secondary size={IconSize.Small} className="ml-auto" />
            )}
          </button>
        );
      })}
    </Drawer>
  );
}
