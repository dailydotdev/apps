import { Item, ItemProps } from '@dailydotdev/react-contexify';
import classNames from 'classnames';
import Link from 'next/link';
import React, { ReactElement } from 'react';
import ConditionalWrapper from '../ConditionalWrapper';
import { IconProps } from '../Icon';

export interface ContextMenuItemProps extends Omit<ItemProps, 'children'> {
  href?: string;
  label: string;
  Icon: React.ComponentType<IconProps>;
}

function ContextMenuItem({
  href,
  label,
  onClick,
  Icon,
  className,
  ...props
}: ContextMenuItemProps): ReactElement {
  return (
    <ConditionalWrapper
      condition={!!href}
      wrapper={(children) => (
        <Link href={href}>
          <a href={href}>{children}</a>
        </Link>
      )}
    >
      <Item
        {...props}
        className={classNames('typo-callout', className)}
        onClick={onClick}
      >
        <span className="flex items-center w-full">
          <Icon size="medium" className="mr-2" />
          {label}
        </span>
      </Item>
    </ConditionalWrapper>
  );
}

export default ContextMenuItem;
