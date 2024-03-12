import React, { ReactElement } from 'react';
import { Button, ButtonProps, ButtonVariant } from '../buttons/Button';

export interface NavItemProps
  extends Pick<ButtonProps<'a'>, 'href' | 'icon' | 'onClick'> {
  label: string;
  isHeader?: boolean;
}

const NavDrawerHeaderItem = ({ label }: { label: string }): ReactElement => (
  <h3 className="my-2 flex h-12 items-center font-bold typo-callout first:mt-0">
    {label}
  </h3>
);

export function NavDrawerItem({
  icon,
  isHeader = false,
  href,
  label,
  onClick,
}: NavItemProps): ReactElement {
  if (isHeader) {
    return <NavDrawerHeaderItem label={label} />;
  }

  return (
    <Button
      role="menuitem"
      type="button"
      icon={icon}
      className="!justify-start !font-normal"
      onClick={onClick}
      href={href}
      tag={href ? 'a' : 'button'}
      variant={ButtonVariant.Tertiary}
    >
      {label}
    </Button>
  );
}
