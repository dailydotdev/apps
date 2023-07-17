import React, { AnchorHTMLAttributes, ReactElement } from 'react';
import { Item, Menu, MenuProps } from '@dailydotdev/react-contexify';
import Portal from '../tooltips/Portal';
import ConditionalWrapper from '../ConditionalWrapper';

export default function PortalMenu(props: MenuProps): ReactElement {
  return (
    <Portal>
      <Menu {...props} />
    </Portal>
  );
}

export interface MenuItemProps<
  TReturn = unknown,
  TArgs extends Array<unknown> = Array<unknown>,
  TAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>,
> {
  icon: ReactElement;
  label: string;
  action?: (...args: TArgs) => TReturn;
  anchorProps?: TAnchorProps;
}

interface ContextMenuProps extends Omit<MenuProps, 'children'> {
  options: MenuItemProps[];
}

export const ContextMenu = ({
  options,
  ...props
}: ContextMenuProps): ReactElement => (
  <PortalMenu
    disableBoundariesCheck
    className="menu-primary"
    animation="fade"
    {...props}
  >
    {options.map(({ label, icon, action, anchorProps }) => (
      <Item key={label} className="typo-callout" onClick={action}>
        <ConditionalWrapper
          condition={!!anchorProps}
          wrapper={(children) => <a {...anchorProps}>{children}</a>}
        >
          <span className="flex gap-2 items-center w-full typo-callout">
            {icon} {label}
          </span>
        </ConditionalWrapper>
      </Item>
    ))}
  </PortalMenu>
);
