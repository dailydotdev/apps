import React, { ComponentType, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { Drawer, DrawerRef, DrawerWrapperProps } from './Drawer';
import { SelectParams } from './common';
import ConditionalWrapper from '../ConditionalWrapper';

export interface ContextMenuDrawerItem {
  label: string;
  icon?: ReactNode;
  anchorProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  action?(params: SelectParams): void;
  Wrapper?: ComponentType<{ children: ReactNode }>;
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
      {options.map(({ label, icon, action, anchorProps, Wrapper }, index) => {
        const classes =
          'flex h-10 flex-row items-center overflow-hidden text-ellipsis whitespace-nowrap px-2 text-text-tertiary typo-callout';
        const content = (
          <>
            {icon && <span className="mr-1">{icon}</span>}
            {label}
          </>
        );

        return (
          <ConditionalWrapper
            key={label}
            condition={!!Wrapper}
            wrapper={(children) => <Wrapper>{children}</Wrapper>}
          >
            {anchorProps ? (
              <a
                {...anchorProps}
                className={classNames(classes, anchorProps.className)}
                role="menuitem"
              >
                {content}
              </a>
            ) : (
              <button
                type="button"
                className={classes}
                onClick={(event) => {
                  action({ value: label, index, event });
                  ref.current.onClose();
                }}
                role="menuitem"
              >
                {content}
              </button>
            )}
          </ConditionalWrapper>
        );
      })}
    </Drawer>
  );
}
