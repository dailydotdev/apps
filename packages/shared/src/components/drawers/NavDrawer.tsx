import React, { ReactElement } from 'react';
import {
  Drawer,
  DrawerPosition,
  DrawerRef,
  DrawerWrapperProps,
} from './Drawer';
import { NavDrawerItem, NavItemProps } from './NavDrawerItem';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import classed from '../../lib/classed';

interface NavDrawerProps {
  drawerProps: Omit<DrawerWrapperProps, 'children'>;
  items: NavItemProps[];
  header?: string;
  shouldKeepOpen?: boolean;
}

const NavDrawerHeader = classed(
  'div',
  'flex items-center gap-3 px-4 border-b border-border-subtlest-tertiary h-12',
);

const NavDrawerContent = classed('div', 'flex flex-col px-4 py-5');

const NavHeading = classed('h2', 'typo-body font-bold');

export function NavDrawer({
  drawerProps,
  header,
  items,
  shouldKeepOpen,
}: NavDrawerProps): ReactElement {
  const ref = React.useRef<DrawerRef>();
  const {
    position,
    displayCloseButton,
    closeOnOutsideClick,
    ...otherDrawerProps
  } = drawerProps;

  return (
    <Drawer
      {...otherDrawerProps}
      closeOnOutsideClick={false}
      displayCloseButton={displayCloseButton}
      isFullScreen
      position={position ?? DrawerPosition.Left}
      ref={ref}
      role="menu"
      className={{
        drawer: 'py-0',
      }}
    >
      {header && (
        <NavDrawerHeader>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={
              shouldKeepOpen ? drawerProps.onClose : ref.current?.onClose
            }
            icon={<ArrowIcon className="-rotate-90" />}
          />
          <NavHeading>{header}</NavHeading>
        </NavDrawerHeader>
      )}
      <NavDrawerContent>
        {items.map((item) => (
          <NavDrawerItem key={item.label} {...item} drawerRef={ref} />
        ))}
      </NavDrawerContent>
    </Drawer>
  );
}
