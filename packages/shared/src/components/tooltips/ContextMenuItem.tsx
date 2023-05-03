import { Item, ItemProps } from '@dailydotdev/react-contexify';
import classNames from 'classnames';
import Link from 'next/link';
import React, { HTMLAttributeAnchorTarget, ReactElement } from 'react';
import ConditionalWrapper from '../ConditionalWrapper';
import { IconProps, IconSize } from '../Icon';

export interface ContextMenuItemProps extends Omit<ItemProps, 'children'> {
  href?: string;
  label: string;
  Icon: React.ComponentType<IconProps>;
  target?: HTMLAttributeAnchorTarget;
}

function ContextMenuItem({
  href,
  label,
  onClick,
  Icon,
  className,
  target,
  ...props
}: ContextMenuItemProps): ReactElement {
  return (
    <ConditionalWrapper
      condition={!!href}
      wrapper={(children) => (
        <Link href={href}>
          <a href={href} target={target}>
            {children}
          </a>
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
