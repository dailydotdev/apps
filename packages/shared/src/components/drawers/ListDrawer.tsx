import React, { ReactElement } from 'react';
import { Drawer, DrawerRef, DrawerWrapperProps } from './Drawer';
import type { SelectParams } from './common';
import { ListDrawerItem, ListDrawerItemProps } from './ListDrawerItem';

interface ListDrawerProps extends Pick<ListDrawerItemProps, 'customItem'> {
  drawerProps: Omit<DrawerWrapperProps, 'children'>;
  options: string[];
  selected: number; // index
  onSelectedChange(props: SelectParams): void;
  shouldIndicateSelected?: boolean;
}

export function ListDrawer({
  onSelectedChange,
  drawerProps,
  selected,
  options,
  customItem,
  shouldIndicateSelected,
}: ListDrawerProps): ReactElement {
  const ref = React.useRef<DrawerRef>();

  return (
    <Drawer {...drawerProps} ref={ref} role="menu">
      {options.map((value, index) => (
        <ListDrawerItem
          key={value}
          value={value}
          index={index}
          customItem={customItem}
          isSelected={
            shouldIndicateSelected === false ? false : index === selected
          }
          onClick={(params) => {
            onSelectedChange({ ...params, index });
            ref.current?.onClose();
          }}
        />
      ))}
    </Drawer>
  );
}
