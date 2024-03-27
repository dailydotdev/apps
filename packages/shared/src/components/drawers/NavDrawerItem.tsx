import React, { MutableRefObject, ReactElement, Ref } from 'react';
import Link from 'next/link';
import { Button, ButtonProps, ButtonVariant } from '../buttons/Button';
import ConditionalWrapper from '../ConditionalWrapper';
import { DrawerRef } from './Drawer';

export type NavItemProps = ButtonProps<'a'> & {
  label: string;
  isHeader?: boolean;
  ref?: MutableRefObject<DrawerRef>;
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
  ref,
  onClick,
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
        onClick={(e) => {
          if (onClick) {
            onClick(e);
          }

          if (ref?.current) {
            ref.current?.onClose();
          }
        }}
      >
        {label}
      </Button>
    </ConditionalWrapper>
  );
}
