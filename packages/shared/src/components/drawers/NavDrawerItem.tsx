import type { MutableRefObject, ReactElement } from 'react';
import React from 'react';
import Link from '../utilities/Link';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonVariant } from '../buttons/Button';
import ConditionalWrapper from '../ConditionalWrapper';
import type { DrawerRef } from './Drawer';

export type NavItemProps = ButtonProps<'a'> & {
  label: string;
  isHeader?: boolean;
  drawerRef?: MutableRefObject<DrawerRef>;
  rightEmoji?: string;
};

const NavDrawerHeaderItem = ({ label }: { label: string }): ReactElement => (
  <h3 className="my-2 flex h-12 items-center font-bold typo-callout first:mt-0">
    {label}
  </h3>
);

export function NavDrawerItem({
  isHeader = false,
  href,
  label,
  drawerRef,
  rightEmoji,
  ...rest
}: NavItemProps): ReactElement {
  if (isHeader) {
    return <NavDrawerHeaderItem label={label} />;
  }

  return (
    <ConditionalWrapper
      condition={!!href}
      wrapper={(children) => <Link href={href}>{children}</Link>}
    >
      <Button
        role="menuitem"
        type="button"
        href={href}
        tag={href ? 'a' : 'button'}
        variant={ButtonVariant.Option}
        {...rest}
      >
        {label}
        {rightEmoji && <span className="ml-auto">{rightEmoji}</span>}
      </Button>
    </ConditionalWrapper>
  );
}
