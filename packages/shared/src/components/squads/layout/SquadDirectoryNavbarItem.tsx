import classNames from 'classnames';
import type { ComponentProps, ReactElement } from 'react';
import React from 'react';
import Link from '../../utilities/Link';
import type { ButtonV2Props, ButtonSize } from '../../buttons/ButtonV2';
import { ButtonV2, ButtonVariant } from '../../buttons/ButtonV2';

interface SquadNavbarItemProps {
  buttonSize: ButtonSize;
  isActive: boolean;
  label: string;
  path?: string;
  onClick?: ButtonV2Props<'a'>['onClick'];
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
  const button = (
    <ButtonV2
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
    </ButtonV2>
  );

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
      {path ? (
        // TODO: WT-2239 - Remove legacyBehavior prop once all SquadDirectoryNavbarItem components are updated
        <Link href={path} legacyBehavior>
          {button}
        </Link>
      ) : (
        button
      )}
    </li>
  );
}
