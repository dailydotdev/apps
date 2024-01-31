import classNames from 'classnames';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
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
        'relative flex flex-col items-center gap-1 rounded-16 border border-theme-divider-tertiary px-4 py-3 hover:cursor-pointer',
        isActive
          ? 'border-theme-divider-primary'
          : 'border-theme-divider-tertiary',
      )}
      onClick={onClick}
      type="button"
    >
      {isActive && (
        <VIcon className="absolute -right-3 -top-3 h-6 w-6 rounded-8 bg-theme-label-primary text-theme-bg-primary" />
      )}
      {icon}
      <span className="font-bold typo-callout">{title}</span>
      <span className="text-theme-label-tertiary typo-footnote">
        {description}
      </span>
    </button>
  );
}
