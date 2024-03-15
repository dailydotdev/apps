import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { Drawer, DrawerRef, DrawerWrapperProps } from './Drawer';
import { SelectParams } from './common';

export interface ContextMenuDrawerItem {
  label: string;
  icon?: ReactNode;
  anchorProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  action?(params: SelectParams): void;
}

interface ContextMenuDrawerProps {
  drawerProps: Omit<DrawerWrapperProps, 'children'>;
  options: ContextMenuDrawerItem[];
}

export function ContextMenuDrawer({
  drawerProps,
  options,
}: ContextMenuDrawerProps): ReactElement {
  const ref = React.useRef<DrawerRef>();

  return (
    <Drawer {...drawerProps} ref={ref}>
      {options.map(({ label, icon, action, anchorProps }, index) => {
        const classes =
          'flex h-10 flex-row items-center overflow-hidden text-ellipsis whitespace-nowrap px-2 text-theme-label-tertiary typo-callout';
        const content = (
          <>
            {icon && <span className="mr-1">{icon}</span>}
            {label}
          </>
        );

        return anchorProps ? (
          <a
            key={label}
            {...anchorProps}
            className={classNames(classes, anchorProps.className)}
          >
            {content}
          </a>
        ) : (
          <button
            key={label}
            type="button"
            className={classes}
            onClick={(event) => {
              action({ value: label, index, event });
              ref.current.onClose();
            }}
          >
            {content}
          </button>
        );
      })}
    </Drawer>
  );
}
