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
  fetchNextPage?: () => Promise<unknown>;
  canFetchMore?: boolean;
  isFetchingNextPage?: boolean;
}

export function ListDrawer({
  onSelectedChange,
  drawerProps,
  selected,
  options,
  customItem,
  shouldIndicateSelected,
  fetchNextPage,
  canFetchMore = false,
  isFetchingNextPage,
}: ListDrawerProps): ReactElement {
  const ref = React.useRef<DrawerRef>();
  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage: fetchNextPage,
    canFetchMore: canFetchMore && !isFetchingNextPage,
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
      {fetchNextPage && (
        <div
          ref={infiniteScrollRef}
          className="pointer-events-none h-px w-px opacity-0"
        />
      )}
      {isFetchingNextPage && <Loader className="mx-auto my-2" />}
    </Drawer>
  );
}
