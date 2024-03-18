import React, { ReactElement } from 'react';
import Link from 'next/link';
import { Button, ButtonProps, ButtonVariant } from '../buttons/Button';
import ConditionalWrapper from '../ConditionalWrapper';

export type NavItemProps = ButtonProps<'a'> & {
  label: string;
  isHeader?: boolean;
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
      </Button>
    </ConditionalWrapper>
  );
}
