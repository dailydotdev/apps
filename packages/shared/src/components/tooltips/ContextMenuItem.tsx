import { Item, ItemProps } from '@dailydotdev/react-contexify';
import classNames from 'classnames';
import Link from 'next/link';
import React, { AnchorHTMLAttributes, ReactElement } from 'react';
import ConditionalWrapper from '../ConditionalWrapper';
import { IconProps, IconSize } from '../Icon';

export interface ContextMenuItemProps extends Omit<ItemProps, 'children'> {
  href?: string;
  label: string;
  Icon: React.ComponentType<IconProps>;
  anchorProps?: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;
}

function ContextMenuItem({
  href,
  label,
  onClick,
  Icon,
  className,
  anchorProps,
  ...props
}: ContextMenuItemProps): ReactElement {
  return (
    <ConditionalWrapper
      condition={!!href}
      wrapper={(children) => (
        <Link href={href}>
          <a {...anchorProps} href={href}>
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
