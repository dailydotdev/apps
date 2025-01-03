import type { ItemProps } from '@dailydotdev/react-contexify';
import { Item } from '@dailydotdev/react-contexify';
import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import Link from '../utilities/Link';
import ConditionalWrapper from '../ConditionalWrapper';
import type { MenuItemProps } from '../fields/ContextMenu';
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
  action,
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
        onClick={action}
      >
        <span className="flex w-full items-center">
          {icon}
          {label}
        </span>
      </Item>
    </ConditionalWrapper>
  );
}

export default ContextMenuItem;
