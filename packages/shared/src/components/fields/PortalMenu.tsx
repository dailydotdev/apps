import React, {
  AnchorHTMLAttributes,
  ComponentType,
  ReactElement,
  ReactNode,
} from 'react';
import { Item, Menu, MenuProps } from '@dailydotdev/react-contexify';
import { RootPortal } from '../tooltips/Portal';
import ConditionalWrapper from '../ConditionalWrapper';
import useContextMenu from '../../hooks/useContextMenu';

export default function PortalMenu({
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
  Wrapper?: ComponentType<{ children: ReactNode }>;
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
    {options.map(({ label, icon, action, anchorProps, Wrapper }) => (
      <ConditionalWrapper
        key={label}
        condition={!!Wrapper}
        wrapper={(children) => <Wrapper>{children}</Wrapper>}
      >
        <Item className="typo-callout" onClick={action}>
          <ConditionalWrapper
            condition={!!anchorProps}
            wrapper={(children) => <a {...anchorProps}>{children}</a>}
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
