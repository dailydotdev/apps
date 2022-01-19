import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import classNames from 'classnames';
import VIcon from '@dailydotdev/shared/icons/v.svg';
import React, { ReactElement, ReactNode } from 'react';

interface CardSelectionProps {
  title: string;
  description: string;
  icon: ReactNode;
  isActive?: boolean;
  onClick?: () => unknown;
}

export function CardSelection({
  title,
  description,
  icon,
  isActive,
  onClick,
}: CardSelectionProps): ReactElement {
  return (
    <button
      className={classNames(
        'relative flex flex-col gap-1 py-3 px-4 items-center border border-theme-divider-tertiary rounded-16 hover:cursor-pointer',
        isActive
          ? 'border-theme-divider-primary'
          : 'border-theme-divider-tertiary',
      )}
      onClick={onClick}
      type="button"
    >
      {isActive && (
        <Button
          icon={<VIcon />}
          buttonSize="xsmall"
          absolute
          className="-top-3 -right-3 bg-theme-label-primary text-theme-bg-primary"
        />
      )}
      {icon}
      <span className="font-bold typo-callout">{title}</span>
      <span className="typo-footnote text-theme-label-tertiary">
        {description}
      </span>
    </button>
  );
}
