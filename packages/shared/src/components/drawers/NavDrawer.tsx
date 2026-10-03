import React, { useRef } from 'react';
import type { PropsWithChildren, ReactElement } from 'react';
import { useRouter } from 'next/router';
import type { DrawerRef, DrawerWrapperProps } from './Drawer';
import { Drawer, DrawerPosition } from './Drawer';
import { ArrowIcon } from '../icons';
import { ShellSquare } from '../shell/ShellSquare';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { webappUrl } from '../../lib/constants';
import { getPathnameWithQuery } from '../../lib';
import { BuyCreditsButton } from '../credit/BuyCreditsButton';
import { useCanPurchaseCores } from '../../hooks/useCoresFeature';
import { Origin } from '../../lib/log';

interface NavDrawerProps extends PropsWithChildren {
  drawerProps: Omit<DrawerWrapperProps, 'children'>;
  header?: string;
  shouldKeepOpen?: boolean;
  showActions?: boolean;
}

export function NavDrawer({
  children,
  drawerProps,
  header,
  shouldKeepOpen,
  showActions = true,
}: NavDrawerProps): ReactElement {
  const {
    position,
    displayCloseButton,
    closeOnOutsideClick,
    ...otherDrawerProps
  } = drawerProps;

  const router = useRouter();
  const canPurchaseCores = useCanPurchaseCores();
  const ref = useRef<DrawerRef>(null) as React.MutableRefObject<DrawerRef>;

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
        wrapper: '!px-0 !pt-0',
      }}
    >
      {header && (
        <div className="flex h-[3.25rem] items-center gap-2 px-4">
          <ShellSquare
            aria-label="Go back"
            onClick={
              shouldKeepOpen ? drawerProps.onClose : ref.current?.onClose
            }
          >
            <ArrowIcon size={IconSize.Small} className="-rotate-90" />
          </ShellSquare>
          <Typography
            bold
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            className="min-w-0 flex-1 truncate px-1"
          >
            {header}
          </Typography>

          {showActions && (
            <BuyCreditsButton
              className="ml-auto"
              hideBuyButton={!canPurchaseCores}
              onPlusClick={() => {
                router.push(
                  getPathnameWithQuery(
                    `${webappUrl}cores`,
                    new URLSearchParams({
                      origin: Origin.ProfileMenu,
                    }),
                  ),
                );
              }}
            />
          )}
        </div>
      )}
      {children}
    </Drawer>
  );
}
