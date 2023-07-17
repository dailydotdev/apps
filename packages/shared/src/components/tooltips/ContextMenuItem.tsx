import { Item, ItemProps } from '@dailydotdev/react-contexify';
import classNames from 'classnames';
import Link from 'next/link';
import React, { ReactElement } from 'react';
import ConditionalWrapper from '../ConditionalWrapper';
import { MenuItemProps } from '../fields/PortalMenu';

export interface ContextMenuItemProps
  extends MenuItemProps,
    Omit<ItemProps, 'children'> {}

function ContextMenuItem({
  label,
  onClick,
  icon,
  className,
  anchorProps,
  ...props
}: ContextMenuItemProps): ReactElement {
  return (
    <ConditionalWrapper
      condition={!!anchorProps?.href}
      wrapper={(children) => (
        <Link href={anchorProps.href}>
          <a {...anchorProps}>{children}</a>
        </Link>
      )}
    >
      <Item
        {...props}
        className={classNames('typo-callout', className)}
        onClick={onClick}
      >
        <span className="flex items-center w-full">
          {icon}
          {label}
        </span>
      </Item>
    </ConditionalWrapper>
  );
}

export default ContextMenuItem;
