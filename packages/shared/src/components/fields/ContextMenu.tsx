import type {
  AnchorHTMLAttributes,
  ComponentType,
  ReactElement,
  ReactNode,
} from 'react';
import React, { useCallback } from 'react';
import type { MenuProps } from '@dailydotdev/react-contexify';
import { Item, Menu } from '@dailydotdev/react-contexify';
import classNames from 'classnames';
import { RootPortal } from '../tooltips/Portal';
import ConditionalWrapper from '../ConditionalWrapper';
import useContextMenu from '../../hooks/useContextMenu';
import { useViewSize, ViewSize } from '../../hooks';
import type { ContextMenuDrawerItem } from '../drawers/ContextMenuDrawer';
import { ContextMenuDrawer } from '../drawers/ContextMenuDrawer';

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
  disabled?: boolean;
}

interface ContextMenuProps extends Omit<MenuProps, 'children'> {
  options: MenuItemProps[] | ContextMenuDrawerItem[];
  isOpen?: boolean;
  className?: string;
}

export default function ContextMenu({
  options,
  onHidden,
  className,
  isOpen: isOpenProps,
  ...props
}: ContextMenuProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { onHide, isOpen: isOpenHook } = useContextMenu({
    id: String(props.id),
  });
  const isOpen = isOpenProps || isOpenHook;
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
      className={classNames('menu-primary', className)}
      onHidden={onHidden}
      {...props}
    >
      {options.map(
        ({
          label,
          icon,
          action,
          anchorProps,
          disabled,
          Wrapper,
        }: MenuItemProps) => (
          <ConditionalWrapper
            key={label}
            condition={!!Wrapper}
            wrapper={(children) => <Wrapper>{children}</Wrapper>}
          >
            <Item className="typo-callout" onClick={action} disabled={disabled}>
              <ConditionalWrapper
                condition={!!anchorProps}
                wrapper={(children) => (
                  <a className="w-full" {...anchorProps}>
                    {children}
                  </a>
                )}
              >
                <span
                  className={classNames(
                    'flex w-full items-center gap-2 typo-callout',
                    disabled && 'text-text-disabled',
                  )}
                >
                  {icon} {label}
                </span>
              </ConditionalWrapper>
            </Item>
          </ConditionalWrapper>
        ),
      )}
    </PortalMenu>
  );
}
