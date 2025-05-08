import React from 'react';
import type { PropsWithChildren, ReactElement } from 'react';
import type { DrawerRef, DrawerWrapperProps } from './Drawer';
import { Drawer, DrawerPosition } from './Drawer';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface NavDrawerProps extends PropsWithChildren {
  drawerProps: Omit<DrawerWrapperProps, 'children'>;
  header?: string;
  shouldKeepOpen?: boolean;
}

export function NavDrawer({
  children,
  drawerProps,
  header,
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
        <div className="flex h-12 items-center gap-3 border-b border-border-subtlest-tertiary">
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={
              shouldKeepOpen ? drawerProps.onClose : ref.current?.onClose
            }
            icon={<ArrowIcon className="-rotate-90" />}
          />
          <Typography bold tag={TypographyTag.H2} type={TypographyType.Body}>
            {header}
          </Typography>
        </div>
      )}
      {children}
    </Drawer>
  );
}
