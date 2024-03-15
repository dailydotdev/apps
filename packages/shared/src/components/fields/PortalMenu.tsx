import React, { AnchorHTMLAttributes, ReactElement } from 'react';
import { Item, Menu, MenuProps } from '@dailydotdev/react-contexify';
import { RootPortal } from '../tooltips/Portal';
import ConditionalWrapper from '../ConditionalWrapper';
import useContextMenu from '../../hooks/useContextMenu';
import { useViewSize, ViewSize } from '../../hooks';
import {
  ContextMenuDrawer,
  ContextMenuDrawerItem,
} from '../drawers/ContextMenuDrawer';

export default function PortalMenu({
  id,
  onHidden: onHiddenProps,
  isOpen,
  drawerOptions,
  ...props
}: MenuProps & {
  drawerOptions: ContextMenuDrawerItem[];
  isOpen: boolean;
}): ReactElement {
  const { onHide } = useContextMenu({ id: id?.toString() });

  const onHidden = () => {
    onHide();
    onHiddenProps?.();
  };

  const isMobile = useViewSize(ViewSize.MobileL);

  if (isMobile) {
    return (
      <RootPortal>
        <ContextMenuDrawer
          drawerProps={{ isOpen, onClose: onHidden, displayCloseButton: true }}
          options={drawerOptions}
        />
      </RootPortal>
    );
  }

  return (
    <RootPortal>
      <Menu {...props} id={id} onHidden={onHidden} />
    </RootPortal>
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
  drawerOptions: ContextMenuDrawerItem[];
  isOpen: boolean;
}

export const ContextMenu = ({
  options,
  ...props
}: ContextMenuProps): ReactElement => (
  <PortalMenu
    disableBoundariesCheck
    className="menu-primary"
    animation="fade"
    drawerOptions={options}
    {...props}
  >
    {options.map(({ label, icon, action, anchorProps }) => (
      <Item key={label} className="typo-callout" onClick={action}>
        <ConditionalWrapper
          condition={!!anchorProps}
          wrapper={(children) => <a {...anchorProps}>{children}</a>}
        >
          <span className="flex w-full items-center gap-2 typo-callout">
            {icon} {label}
          </span>
        </ConditionalWrapper>
      </Item>
    ))}
  </PortalMenu>
);
