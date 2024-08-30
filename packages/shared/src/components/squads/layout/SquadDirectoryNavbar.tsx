import React, { ComponentProps, ReactElement } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';

interface SquadNavbarItemProps extends Omit<ComponentProps<'li'>, 'onClick'> {
  buttonSize: ButtonSize;
  isActive: boolean;
  label: string;
  onClick: ButtonProps<'a'>['onClick'];
  path?: string;
}

export const SquadDirectoryNavbarItem = ({
  buttonSize,
  className,
  isActive,
  label,
  onClick,
  path,
  ...attrs
}: SquadNavbarItemProps): ReactElement => (
  <li
    {...attrs}
    className={classNames(
      'relative py-3',
      'after:absolute after:bottom-0 after:left-0 after:right-0 after:mx-auto after:w-14 after:border-b-2',
      {
        'after:hidden': !isActive,
      },
      className,
    )}
  >
    <Button
      aria-label={`Navigate to ${label}'s squad directory`}
      className="capitalize"
      href={path}
      onClick={onClick}
      size={buttonSize}
      tag={path ? 'a' : 'button'}
      variant={isActive ? ButtonVariant.Float : ButtonVariant.Tertiary}
    >
      {label}
    </Button>
  </li>
);

export const SquadDirectoryNavbar = (
  props: ComponentProps<'nav'>,
): ReactElement => {
  const { className, children, ...attrs } = props;

  return (
    <nav
      {...attrs}
      className={classNames(
        '-mx-4 border-b border-border-subtlest-tertiary px-4 laptop:mx-0 laptop:border-0 laptop:px-0',
        className,
      )}
    >
      <ul className="no-scrollbar laptop:3 -mx-4 flex flex-row flex-nowrap gap-2 overflow-x-auto px-4">
        {children}
      </ul>
    </nav>
  );
};
