import { Item, ItemProps } from '@dailydotdev/react-contexify';
import classNames from 'classnames';
import Link from 'next/link';
import React, { ReactElement } from 'react';
import ConditionalWrapper from '../ConditionalWrapper';
import { IconProps, IconSize } from '../Icon';
import { MenuItemProps } from '../fields/PortalMenu';

export interface ContextMenuItemProps
  extends MenuItemProps,
    Omit<ItemProps, 'children'> {
  Icon: React.ComponentType<IconProps>;
}

function ContextMenuItem({
  label,
  onClick,
  Icon,
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
          <Icon size={IconSize.Small} className="mr-2" />
          {label}
        </span>
      </Item>
    </ConditionalWrapper>
  );
}

export default ContextMenuItem;
