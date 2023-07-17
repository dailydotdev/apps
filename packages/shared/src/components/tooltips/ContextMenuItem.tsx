import { Item, ItemProps } from '@dailydotdev/react-contexify';
import classNames from 'classnames';
import Link from 'next/link';
import React, { ReactElement } from 'react';
import ConditionalWrapper from '../ConditionalWrapper';
import { MenuItemProps } from '../fields/PortalMenu';
import { IconSize } from '../Icon';

export interface ContextMenuItemProps
  extends MenuItemProps,
    Omit<ItemProps, 'children'> {}

interface ContextMenuIconProps {
  Icon: React.ComponentType<{ className; size }>;
}

export const ContextMenuIcon = ({
  Icon,
}: ContextMenuIconProps): ReactElement => (
  <Icon size={IconSize.Small} className="mr-2" />
);

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
