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

export interface ContextMenuItemProps<
  TArgs extends Array<unknown> = Array<unknown>,
> {
  icon: ReactElement;
  text: string;
  action?: (...args: TArgs) => Promise<void>;
  anchorProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
}

interface ContextMenuProps extends Omit<MenuProps, 'children'> {
  options: ContextMenuItemProps[];
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
    {options.map(({ text, icon, action, anchorProps }) => (
      <Item key={text} className="typo-callout" onClick={action}>
        <ConditionalWrapper
          condition={!!anchorProps}
          wrapper={(children) => <a {...anchorProps}>{children}</a>}
        >
          <span className="flex gap-2 items-center w-full typo-callout">
            {icon} {text}
          </span>
        </ConditionalWrapper>
      </Item>
    ))}
  </PortalMenu>
);
