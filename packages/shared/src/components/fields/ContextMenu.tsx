import React, {
  AnchorHTMLAttributes,
  ComponentType,
  ReactElement,
  ReactNode,
  useCallback,
} from 'react';
import { Item, Menu, MenuProps } from '@dailydotdev/react-contexify';
import { RootPortal } from '../tooltips/Portal';
import ConditionalWrapper from '../ConditionalWrapper';
import useContextMenu from '../../hooks/useContextMenu';
import { useViewSize, ViewSize } from '../../hooks';
import {
  ContextMenuDrawer,
  ContextMenuDrawerItem,
} from '../drawers/ContextMenuDrawer';

function PortalMenu({
  id,
  onHidden: onHiddenProps,
  ...props
}: MenuProps): ReactElement {
  const { onHide } = useContextMenu({ id: id?.toString() });

  const onHidden = () => {
    onHide();
    onHiddenProps?.();
  };

  return (
    <RootPortal>
      <Menu
        {...props}
        animation={{ enter: 'fade', exit: false }}
        id={id}
        onHidden={onHidden}
      />
    </RootPortal>
  );
}

export interface MenuItemProps<
  TReturn = unknown,
  TArgs extends Array<unknown> = Array<unknown>,
  TAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>,
> {
  icon?: ReactNode;
  label: string;
  action?: (...args: TArgs) => TReturn;
  anchorProps?: TAnchorProps;
  Wrapper?: ComponentType<{ children: ReactNode }>;
}

interface ContextMenuProps extends Omit<MenuProps, 'children'> {
  options: MenuItemProps[] | ContextMenuDrawerItem[];
  isOpen?: boolean;
}

export default function ContextMenu({
  options,
  onHidden,
  isOpen,
  ...props
}: ContextMenuProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { onHide } = useContextMenu({ id: String(props.id) });

  const handleClose = useCallback(() => {
    onHide();
    onHidden?.();
  }, [onHide, onHidden]);

  if (isMobile) {
    return (
      <RootPortal>
        <ContextMenuDrawer
          drawerProps={{
            isOpen,
            onClose: handleClose,
            displayCloseButton: true,
          }}
          options={options}
        />
      </RootPortal>
    );
  }

  return (
    <PortalMenu
      disableBoundariesCheck
      className="menu-primary"
      onHidden={onHidden}
      {...props}
    >
      {options.map(({ label, icon, action, anchorProps, Wrapper }) => (
        <ConditionalWrapper
          key={label}
          condition={!!Wrapper}
          wrapper={(children) => <Wrapper>{children}</Wrapper>}
        >
          <Item className="typo-callout" onClick={action}>
            <ConditionalWrapper
              condition={!!anchorProps}
              wrapper={(children) => (
                <a className="w-full" {...anchorProps}>
                  {children}
                </a>
              )}
            >
              <span className="flex w-full items-center gap-2 typo-callout">
                {icon} {label}
              </span>
            </ConditionalWrapper>
          </Item>
        </ConditionalWrapper>
      ))}
    </PortalMenu>
  );
}
