import React, { ReactElement } from 'react';
import { Drawer, DrawerRef, DrawerWrapperProps } from './Drawer';
import type { SelectParams } from './common';
import { ListDrawerItem } from './ListDrawerItem';

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
      {options.map((value, index) => (
        <ListDrawerItem
          key={value}
          value={value}
          isSelected={index === selected}
          onClick={(params) => {
            onSelectedChange({ ...params, index });
            ref.current?.onClose();
          }}
        />
      ))}
    </Drawer>
  );
}
