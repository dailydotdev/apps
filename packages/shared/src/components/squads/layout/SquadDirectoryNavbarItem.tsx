import classNames from 'classnames';
import React, { ComponentProps, ReactElement } from 'react';
import Link from 'next/link';
import ConditionalWrapper from '../../ConditionalWrapper';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';

interface SquadNavbarItemProps {
  buttonSize: ButtonSize;
  isActive: boolean;
  label: string;
  path?: string;
  onClick: ButtonProps<'a'>['onClick'];
  elementProps?: Omit<ComponentProps<'li'>, 'onClick'>;
}

export function SquadDirectoryNavbarItem({
  buttonSize,
  isActive,
  label,
  path,
  onClick,
  elementProps = {},
}: SquadNavbarItemProps): ReactElement {
  return (
    <li
      {...elementProps}
      className={classNames(
        'relative py-3',
        'after:absolute after:bottom-0 after:left-0 after:right-0 after:mx-auto after:w-14 after:border-b-2',
        { 'after:hidden': !isActive },
        elementProps?.className,
      )}
    >
      <ConditionalWrapper
        condition={!!path}
        wrapper={(component) => <Link href={path}>{component}</Link>}
      >
        <Button
          aria-current={isActive ? 'page' : undefined}
          aria-label={`Navigate to ${label}'s directory page`}
          className="capitalize"
          href={path}
          onClick={onClick}
          size={buttonSize}
          tag={path ? 'a' : 'button'}
          variant={isActive ? ButtonVariant.Float : ButtonVariant.Tertiary}
        >
          {label}
        </Button>
      </ConditionalWrapper>
    </li>
  );
}
