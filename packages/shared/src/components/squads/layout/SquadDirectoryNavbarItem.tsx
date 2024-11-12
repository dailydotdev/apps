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
  onClick?: ButtonProps<'a'>['onClick'];
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
        'after:absolute after:bottom-0 after:left-0 after:right-0 after:mx-auto after:w-1/2 after:border-b-2',
        { 'after:hidden': !isActive },
        elementProps?.className,
      )}
    >
      <ConditionalWrapper
        condition={!!path}
        wrapper={(component) => (
          // TODO: WT-2239 - Remove legacyBehavior prop once all SquadDirectoryNavbarItem components are updated
          <Link href={path} legacyBehavior>
            {component}
          </Link>
        )}
      >
        <Button
          aria-current={isActive ? 'page' : undefined}
          aria-label={`Navigate to ${label}'s directory page`}
          className="capitalize"
          href={path}
          onClick={onClick}
          size={buttonSize}
          tag={path ? 'a' : 'button'}
          pressed={isActive}
          variant={isActive ? ButtonVariant.Float : ButtonVariant.Tertiary}
        >
          {label}
        </Button>
      </ConditionalWrapper>
    </li>
  );
}
