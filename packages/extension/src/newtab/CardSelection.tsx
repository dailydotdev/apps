import classNames from 'classnames';
import VIcon from '@dailydotdev/shared/src/components/icons/V';
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
        <VIcon className="absolute -top-3 -right-3 w-6 h-6 rounded-8 bg-theme-label-primary text-theme-bg-primary" />
      )}
      {icon}
      <span className="font-bold typo-callout">{title}</span>
      <span className="typo-footnote text-theme-label-tertiary">
        {description}
      </span>
    </button>
  );
}
