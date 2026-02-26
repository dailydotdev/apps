import type { ReactElement } from 'react';
import React from 'react';
import type { DrawerRef, DrawerWrapperProps } from './Drawer';
import { Drawer } from './Drawer';
import type { SelectParams } from './common';
import type { ListDrawerItemProps } from './ListDrawerItem';
import { ListDrawerItem } from './ListDrawerItem';
import useFeedInfiniteScroll from '../../hooks/feed/useFeedInfiniteScroll';
import { Loader } from '../Loader';

interface ListDrawerProps extends Pick<ListDrawerItemProps, 'customItem'> {
  drawerProps: Omit<DrawerWrapperProps, 'children'>;
  options: string[];
  selected: number; // index
  onSelectedChange(props: SelectParams): void;
  shouldIndicateSelected?: boolean;
  onScrollEnd?: () => void;
  isFetchingMore?: boolean;
}

export function ListDrawer({
  onSelectedChange,
  drawerProps,
  selected,
  options,
  customItem,
  shouldIndicateSelected,
  onScrollEnd,
  isFetchingMore,
}: ListDrawerProps): ReactElement {
  const ref = React.useRef<DrawerRef>();
  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage: onScrollEnd ?? (() => {}),
    canFetchMore: !!onScrollEnd,
  });

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
      {onScrollEnd && (
        <div
          ref={infiniteScrollRef}
          className="pointer-events-none h-px w-px opacity-0"
        />
      )}
      {isFetchingMore && <Loader className="mx-auto my-2" />}
    </Drawer>
  );
}
